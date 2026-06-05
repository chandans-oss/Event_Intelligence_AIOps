import os
from pathlib import Path

# Setup Hugging Face cache to point to backend/rag/models local directory
CURRENT_FILE = Path(__file__).resolve()
BACKEND_ROOT = CURRENT_FILE.parents[2]  # backend/
LOCAL_MODEL_CACHE = str(BACKEND_ROOT / "rag" / "models")

os.environ["HF_HOME"] = LOCAL_MODEL_CACHE
os.environ["TRANSFORMERS_CACHE"] = LOCAL_MODEL_CACHE
os.environ["SENTENCE_TRANSFORMERS_HOME"] = LOCAL_MODEL_CACHE
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import torch
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
import json
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# Cache loaded models globally so we don't reload them on every request
_MODEL_CACHE = {}

def get_model(model_name):
    if model_name not in _MODEL_CACHE:
        # Load SBERT model
        _MODEL_CACHE[model_name] = SentenceTransformer(model_name)
    return _MODEL_CACHE[model_name]

def get_token_embeddings(model, sentences):
    """
    Returns token embeddings, attention mask, and tokens list for a list of sentences.
    """
    # Tokenize sentences
    features = model.tokenize(sentences)
    
    # Move to appropriate device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    features = {k: v.to(device) if hasattr(v, 'to') else v for k, v in features.items()}
    
    with torch.no_grad():
        # SentenceTransformer index 0 is usually the transformer model itself
        out = model[0](features)
        token_embeddings = out['token_embeddings']
        attention_mask = features['attention_mask']
        
    # Generate human-readable tokens list
    all_tokens = []
    for sentence in sentences:
        tokens = model.tokenizer.tokenize(sentence)
        # SBERT prepends [CLS] and appends [SEP]
        tokens = ["[CLS]"] + tokens + ["[SEP]"]
        all_tokens.append(tokens)
        
    return token_embeddings, attention_mask, all_tokens

def apply_pooling(token_embeddings, attention_mask, strategy):
    """
    Apply CLS, Mean, or Max pooling strategies.
    """
    if strategy == "CLS Pooling":
        return token_embeddings[:, 0, :]
    
    elif strategy == "Mean Pooling":
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        return sum_embeddings / sum_mask
    
    elif strategy == "Max Pooling":
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        # Set padding to a very low value so it's not selected by max()
        t_embs = token_embeddings.clone()
        t_embs[input_mask_expanded == 0] = -1e9
        return torch.max(t_embs, 1)[0]
    
    return None

def calculate_similarity(embedding_a, embedding_b):
    emb_a = embedding_a.cpu().numpy() if torch.is_tensor(embedding_a) else embedding_a
    emb_b = embedding_b.cpu().numpy() if torch.is_tensor(embedding_b) else embedding_b
    
    if len(emb_a.shape) == 1:
        emb_a = emb_a.reshape(1, -1)
    if len(emb_b.shape) == 1:
        emb_b = emb_b.reshape(1, -1)
        
    return float(cosine_similarity(emb_a, emb_b)[0][0])

def reduce_dimensions(embeddings_list):
    pca = PCA(n_components=2)
    X = np.vstack([emb.cpu().numpy() if torch.is_tensor(emb) else emb for emb in embeddings_list])
    # PCA needs at least 2 samples; if we have fewer, return zero coords
    if X.shape[0] < 2:
        return np.zeros((X.shape[0], 2))
    return pca.fit_transform(X)

@method_decorator(csrf_exempt, name='dispatch')
class SemanticCheckView(APIView):
    """
    POST /api/training/semantic-check
    Runs sentence transformer embedding, pooling, similarity comparison,
    token analysis, and 2D mapping projection.
    """
    def post(self, request):
        try:
            body = json.loads(request.body or '{}')
            sentence_a = body.get("sentence_a", "").strip()
            sentence_b = body.get("sentence_b", "").strip()
            model_name = body.get("model_name", "all-MiniLM-L6-v2").strip()
            pooling_strategy = body.get("pooling_strategy", "Mean Pooling").strip()
            
            if not sentence_a or not sentence_b:
                return Response({"error": "Both sentence_a and sentence_b are required."}, status=status.HTTP_400_BAD_REQUEST)
            
            if model_name not in ["all-MiniLM-L6-v2", "all-mpnet-base-v2", "BAAI/bge-base-en-v1.5"]:
                return Response({"error": "Invalid model selection."}, status=status.HTTP_400_BAD_REQUEST)
                
            model = get_model(model_name)
            
            # 1. Get token embeddings
            token_embs, masks, tokens_list = get_token_embeddings(model, [sentence_a, sentence_b])
            
            # 2. Apply chosen pooling strategy
            emb_a = apply_pooling(token_embs[0:1], masks[0:1], pooling_strategy)
            emb_b = apply_pooling(token_embs[1:2], masks[1:2], pooling_strategy)
            
            # 3. Compute similarities for all strategies
            similarities = {}
            for strat in ["Mean Pooling", "Max Pooling", "CLS Pooling"]:
                e_a = apply_pooling(token_embs[0:1], masks[0:1], strat)
                e_b = apply_pooling(token_embs[1:2], masks[1:2], strat)
                similarities[strat] = calculate_similarity(e_a, e_b)
                
            # 4. Detail computations for selected strategy
            selected_similarity = similarities[pooling_strategy]
            
            # Detailed similarity steps
            dot_prod = float(np.dot(emb_a.cpu().numpy().flatten(), emb_b.cpu().numpy().flatten()))
            norm_a = float(np.linalg.norm(emb_a.cpu().numpy()))
            norm_b = float(np.linalg.norm(emb_b.cpu().numpy()))
            
            # 5. Token-level values for first 10 dimensions
            token_analysis_a = []
            for token_idx, token in enumerate(tokens_list[0]):
                emb_vals = token_embs[0, token_idx, :10].cpu().numpy().tolist()
                token_analysis_a.append({
                    "token": token,
                    "values": [round(v, 4) for v in emb_vals]
                })
                
            token_analysis_b = []
            for token_idx, token in enumerate(tokens_list[1]):
                emb_vals = token_embs[1, token_idx, :10].cpu().numpy().tolist()
                token_analysis_b.append({
                    "token": token,
                    "values": [round(v, 4) for v in emb_vals]
                })
                
            # 6. Reduce dimensions to 2D
            all_points = []
            labels = []
            types = []
            
            # Add sentence embeddings (using selected pooling strategy)
            all_points.append(emb_a.cpu().numpy().flatten())
            labels.append("Sentence A")
            types.append("Sentence (Final)")
            
            all_points.append(emb_b.cpu().numpy().flatten())
            labels.append("Sentence B")
            types.append("Sentence (Final)")
            
            # Add word token embeddings (up to first 10 tokens)
            for j, (tokens, emb) in enumerate(zip(tokens_list, token_embs)):
                for k in range(min(12, len(tokens))):
                    all_points.append(emb[k].cpu().numpy())
                    labels.append(f"'{tokens[k]}'")
                    types.append(f"Tokens from S{chr(65+j)}")
                    
            X_2d = reduce_dimensions(all_points)
            
            pca_points = []
            for idx, coord in enumerate(X_2d):
                pca_points.append({
                    "x": float(coord[0]),
                    "y": float(coord[1]),
                    "label": labels[idx],
                    "type": types[idx]
                })
                
            # 7. Embeddings preview (first 10 values)
            vector_preview_a = [round(float(x), 4) for x in emb_a.cpu().numpy().flatten()[:10]]
            vector_preview_b = [round(float(x), 4) for x in emb_b.cpu().numpy().flatten()[:10]]
            
            response_data = {
                "similarities": similarities,
                "selected_similarity": selected_similarity,
                "selected_strategy": pooling_strategy,
                "vector_a_preview": vector_preview_a,
                "vector_b_preview": vector_preview_b,
                "vector_shape": list(emb_a.shape[1:]),
                "calculation_details": {
                    "dot_product": round(dot_prod, 4),
                    "norm_a": round(norm_a, 4),
                    "norm_b": round(norm_b, 4),
                },
                "token_analysis_a": token_analysis_a,
                "token_analysis_b": token_analysis_b,
                "pca_points": pca_points
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
