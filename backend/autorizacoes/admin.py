from django.contrib import admin
from .models import Autorizacao

@admin.register(Autorizacao)
class AutorizacaoAdmin(admin.ModelAdmin):
    list_display = ['aluno', 'tipo', 'data_hora']
    list_filter = ['tipo', 'data_hora']
    search_fields = ['aluno__nome', 'motivo']