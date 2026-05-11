from django.urls import path
from .views import RunRCAFlowView, RunRAGAnalysisView, RAGKBView

urlpatterns = [
    path('rca/run-flow', RunRCAFlowView.as_view(), name='run-rca-flow'),
    path('rag/analyze', RunRAGAnalysisView.as_view(), name='run-rag-analyze'),
    path('rag/kb/', RAGKBView.as_view(), name='rag-kb'),
]
