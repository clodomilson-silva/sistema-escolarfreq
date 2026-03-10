from django.contrib import admin
from .models import Turma, Autorizacao


@admin.register(Turma)
class TurmaAdmin(admin.ModelAdmin):
    """Admin for Turma model"""
    
    list_display = ['nome', 'ano', 'turno', 'disciplina', 'status', 'total_alunos', 'criado_em']
    list_filter = ['ano', 'turno', 'status']
    search_fields = ['nome', 'disciplina', 'professor']
    filter_horizontal = ['alunos']
    ordering = ['nome']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'ano', 'turno', 'disciplina', 'professor', 'sala')
        }),
        ('Alunos', {
            'fields': ('alunos',)
        }),
        ('Configurações', {
            'fields': ('horarios', 'dias_letivos', 'status')
        }),
        ('Metadata', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['criado_em', 'atualizado_em']


@admin.register(Autorizacao)
class AutorizacaoAdmin(admin.ModelAdmin):
    """Admin for Autorizacao model"""
    
    list_display = ['aluno', 'turma', 'tipo', 'data', 'status', 'criado_em']
    list_filter = ['tipo', 'status', 'data']
    search_fields = ['aluno__nome', 'turma__nome', 'motivo']
    ordering = ['-data', '-criado_em']
    
    fieldsets = (
        ('Informações', {
            'fields': ('turma', 'aluno', 'tipo', 'data')
        }),
        ('Detalhes', {
            'fields': ('motivo', 'observacoes', 'status')
        }),
        ('Metadata', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['criado_em', 'atualizado_em']
