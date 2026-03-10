from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurmaViewSet, AutorizacaoViewSet, AvaliacaoViewSet, NotaViewSet

# Usar um único router para todos os ViewSets
router = DefaultRouter()

# Registrar ViewSets com prefixos específicos
# A ordem importa: rotas mais específicas primeiro
router.register(r'avaliacoes', AvaliacaoViewSet, basename='avaliacao')
router.register(r'notas', NotaViewSet, basename='nota')
router.register(r'autorizacoes', AutorizacaoViewSet, basename='autorizacao')
# TurmaViewSet sem prefixo (raiz) por último
router.register(r'', TurmaViewSet, basename='turma')

urlpatterns = [
    path('', include(router.urls)),
]
