from django.contrib import admin
from .models import Frequencia


@admin.register(Frequencia)
class FrequenciaAdmin(admin.ModelAdmin):
    """Admin for Frequencia model"""
    
    list_display = ['aluno', 'turma', 'data', 'disciplina', 'status', 'criado_em']
    list_filter = ['status', 'data', 'turma', 'disciplina']
    search_fields = ['aluno__nome', 'turma__nome', 'disciplina']
    ordering = ['-data', 'turma', 'aluno']
    
    fieldsets = (
        ('Informações', {
            'fields': ('turma', 'aluno', 'data', 'disciplina')
        }),
        ('Status', {
            'fields': ('status', 'observacoes')
        }),
        ('Metadata', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['criado_em', 'atualizado_em']
