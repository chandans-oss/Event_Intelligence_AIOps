from django.urls import path
from .views import RunRCAFlowView

urlpatterns = [
    path('rca/run-flow', RunRCAFlowView.as_view(), name='run-rca-flow'),
]
