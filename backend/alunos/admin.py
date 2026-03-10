from django.contrib import admin
from .models import Aluno


@admin.register(Aluno)
class AlunoAdmin(admin.ModelAdmin):
    """Admin for Aluno model"""
    
    list_display = ['nome', 'matricula', 'email', 'data_nascimento', 'criado_em']
    list_filter = ['data_nascimento', 'criado_em']
    search_fields = ['nome', 'matricula', 'email']
    ordering = ['nome']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'matricula', 'email', 'data_nascimento')
        }),
        ('Contato', {
            'fields': ('telefone', 'endereco')
        }),
        ('Responsável', {
            'fields': ('responsavel', 'telefone_responsavel')
        }),
        ('Metadata', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['criado_em', 'atualizado_em']
