from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurmaViewSet, AutorizacaoViewSet

router = DefaultRouter()
router.register(r'', TurmaViewSet, basename='turma')
router.register(r'autorizacoes', AutorizacaoViewSet, basename='autorizacao')

urlpatterns = [
    path('', include(router.urls)),
]
