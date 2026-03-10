from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FrequenciaViewSet

router = DefaultRouter()
router.register(r'', FrequenciaViewSet, basename='frequencia')

urlpatterns = [
    path('', include(router.urls)),
]
