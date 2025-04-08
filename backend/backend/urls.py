from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.contrib import admin
from rest_framework import permissions
from alunos.views import AlunoViewSet
from turmas.views import TurmaViewSet
from autorizacoes.views import AutorizacaoViewSet
from frequencia.views import FrequenciaViewSet

router = DefaultRouter()
router.register(r'alunos', AlunoViewSet, basename='aluno')
router.register(r'turmas', TurmaViewSet)
router.register(r'autorizacoes', AutorizacaoViewSet, basename='autorizacao')
router.register(r'frequencia', FrequenciaViewSet, basename='frequencia')

schema_view = get_schema_view(
    openapi.Info(
        title="Sistema Escolar API",
        default_version="v1",
        description="Documentação da API do Sistema Escolar",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="suporte@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
