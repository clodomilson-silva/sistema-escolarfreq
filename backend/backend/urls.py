from django.urls import path, include
from rest_framework.routers import DefaultRouter
from alunos.views import AlunoViewSet
from turmas.views import TurmaViewSet

router = DefaultRouter()
router.register(r'alunos', AlunoViewSet, basename='aluno')
router.register(r'turmas', TurmaViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
