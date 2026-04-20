import uuid
import datetime
from datetime import timedelta
from sentence_transformers import SentenceTransformer
from ingest_historical_rca import  get_db_connection, EMBEDING_MODEL

# Initialize the same model used during ingestion
model = SentenceTransformer(EMBEDING_MODEL)  

# Sample test query
TEST_QUERY = "Device router-zoneC-R1 temperature has increased sharply to 46.8°C causing thermal impact on it performance"

def test_similarity_search():
    print("🔧 Starting RCA similarity test...\n")


    # Step 2: Encode the test query
    print(f"🔍 Query: '{TEST_QUERY}'")
    query_embedding = model.encode(TEST_QUERY).tolist()
    query_embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"

    # Step 3: Connect and perform similarity search
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Cosine similarity: 1 - (embedding <=> query) gives similarity (higher = more similar)
            cur.execute("""
                SELECT 
                    incident_id,
                    situation_summary,
                    root_cause_prediction,
                    confidence_score,
                    remediation,
                    1 - (embedding <=> %s::vector) AS similarity_score
                FROM historical_rca_cases
                ORDER BY embedding <=> %s::vector
                LIMIT 3;
            """, (query_embedding_str, query_embedding_str))

            results = cur.fetchall()

            print("\n🎯 Top 3 Most Similar Cases:\n")
            for i, row in enumerate(results, 1):
                incident_id, summary, rca, conf, rem, sim_score = row
                print(f"{i}. Incident ID: {incident_id}")
                print(f"   Summary: {summary}")
                print(f"   Predicted RCA: {rca}")
                print(f"   Confidence: {conf:.2f}")
                print(f"   Remediation: {rem}")
                print(f"   Similarity Score: {sim_score:.4f}")
                print("-" * 60)

            # Optional: assert that top result has high similarity
            if results:
                top_sim = results[0][5]
                assert top_sim > 0.5, f"Expected top similarity > 0.5, got {top_sim:.4f}"
                print(f"\n✅ Test passed: Top similarity = {top_sim:.4f} (> 0.5)")

    except Exception as e:
        print(f"❌ Query failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    test_similarity_search()