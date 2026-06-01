from django.urls import path
from .views import RunRCAFlowView, RunRAGAnalysisView, RAGKBView, RunRAGV6AnalysisView
from .training_views import (
    GenerateDatasetView,
    StartTrainingView,
    TrainingStatusView,
    PredictView,
    ModelInfoView,
)

urlpatterns = [
    path('rca/run-flow', RunRCAFlowView.as_view(), name='run-rca-flow'),
    path('rag/analyze', RunRAGAnalysisView.as_view(), name='run-rag-analyze'),
    path('rag/kb/', RAGKBView.as_view(), name='rag-kb'),
    path('rag/v6/analyze', RunRAGV6AnalysisView.as_view(), name='run-rag-v6-analyze'),

    # ── Model Training ─────────────────────────────────────────────────────────
    path('training/generate-dataset', GenerateDatasetView.as_view(), name='training-generate-dataset'),
    path('training/start',            StartTrainingView.as_view(),    name='training-start'),
    path('training/status',           TrainingStatusView.as_view(),   name='training-status'),
    path('training/predict',          PredictView.as_view(),          name='training-predict'),
    path('training/model-info',       ModelInfoView.as_view(),        name='training-model-info'),
]

