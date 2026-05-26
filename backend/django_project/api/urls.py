from django.urls import path
from .views import RunRCAFlowView, RunRAGAnalysisView, RAGKBView, RunRAGV6AnalysisView

urlpatterns = [
    path('rca/run-flow', RunRCAFlowView.as_view(), name='run-rca-flow'),
    path('rag/analyze', RunRAGAnalysisView.as_view(), name='run-rag-analyze'),
    path('rag/kb/', RAGKBView.as_view(), name='rag-kb'),
    path('rag/v6/analyze', RunRAGV6AnalysisView.as_view(), name='run-rag-v6-analyze'),
]
