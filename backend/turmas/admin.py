from django.contrib import admin
from .models import Turma, Autorizacao, Avaliacao, Nota


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
        ('Tipo de Turma', {
            'fields': ('tipo', 'turma_base')
        }),
        ('Período Letivo', {
            'fields': ('data_inicio', 'data_fim')
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


@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    """Admin for Avaliacao model"""
    
    list_display = ['descricao', 'turma', 'tipo', 'data', 'peso', 'nota_maxima', 'total_notas_lancadas']
    list_filter = ['tipo', 'data', 'turma']
    search_fields = ['descricao', 'turma__nome']
    ordering = ['-data', 'descricao']
    
    fieldsets = (
        ('Informações', {
            'fields': ('turma', 'descricao', 'tipo', 'data')
        }),
        ('Avaliação', {
            'fields': ('peso', 'nota_maxima', 'observacoes')
        }),
        ('Metadata', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['criado_em', 'atualizado_em']
    
    def total_notas_lancadas(self, obj):
        return obj.notas.count()
    total_notas_lancadas.short_description = 'Notas Lançadas'


@admin.register(Nota)
class NotaAdmin(admin.ModelAdmin):
    """Admin for Nota model"""
    
    list_display = ['aluno', 'avaliacao', 'valor', 'get_nota_maxima', 'criado_em']
    list_filter = ['avaliacao__turma', 'avaliacao__tipo', 'avaliacao__data']
    search_fields = ['aluno__nome', 'avaliacao__descricao']
    ordering = ['avaliacao', 'aluno__nome']
    
    fieldsets = (
        ('Informações', {
            'fields': ('avaliacao', 'aluno', 'valor')
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Metadata', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['criado_em', 'atualizado_em']
    
    def get_nota_maxima(self, obj):
        return obj.avaliacao.nota_maxima
    get_nota_maxima.short_description = 'Nota Máxima'
