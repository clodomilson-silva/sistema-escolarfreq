from django.contrib import admin
from .models import Autorizacao

@admin.register(Autorizacao)
class AutorizacaoAdmin(admin.ModelAdmin):
    list_display = ('aluno', 'tipo', 'data', 'hora')  # ✅ Correto
    list_filter = ('tipo', 'data')  # ✅ Correto
    search_fields = ['aluno__nome', 'motivo']