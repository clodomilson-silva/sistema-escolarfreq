from django.urls import path, include
from rest_framework.routers import DefaultRouter
from alunos.views import AlunoViewSet
from turmas.views import TurmaViewSet
from autorizacoes.views import AutorizacaoViewSet
from frequencia.views import FrequenciaViewSet


router = DefaultRouter()
router.register(r'alunos', AlunoViewSet, basename='aluno')
router.register(r'turmas', TurmaViewSet)
router.register(r'autorizacoes', AutorizacaoViewSet, basename='autorizacao')
router.register(r'frequencia', FrequenciaViewSet, basename='frequencia')

urlpatterns = [
    path('api/', include(router.urls)),
]
