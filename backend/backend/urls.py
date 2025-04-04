from django.urls import path, include
from rest_framework.routers import DefaultRouter
from alunos.views import AlunoViewSet
from turmas.views import TurmaViewSet
from autorizacoes.views import AutorizacaoViewSet


router = DefaultRouter()
router.register(r'alunos', AlunoViewSet, basename='aluno')
router.register(r'turmas', TurmaViewSet)
router.register(r'autorizacoes', AutorizacaoViewSet, basename='autorizacao')

urlpatterns = [
    path('api/', include(router.urls)),
]
