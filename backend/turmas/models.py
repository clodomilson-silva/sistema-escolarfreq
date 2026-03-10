from django.db import models
from django.utils import timezone
from alunos.models import Aluno


class Turma(models.Model):
    """Model for classes/turmas"""
    
    TURNO_CHOICES = [
        ('matutino', 'Matutino'),
        ('vespertino', 'Vespertino'),
        ('noturno', 'Noturno'),
        ('integral', 'Integral'),
    ]
    
    STATUS_CHOICES = [
        ('ativa', 'Ativa'),
        ('inativa', 'Inativa'),
        ('concluida', 'Concluída'),
    ]
    
    TIPO_CHOICES = [
        ('base', 'Turma Base'),
        ('disciplina', 'Turma-Disciplina'),
    ]
    
    nome = models.CharField('Nome', max_length=100, unique=True)
    ano = models.IntegerField('Ano')
    turno = models.CharField('Turno', max_length=20, choices=TURNO_CHOICES)
    disciplina = models.CharField('Disciplina', max_length=100, blank=True, default='Geral')
    professor = models.CharField('Professor', max_length=255, blank=True, null=True)
    sala = models.CharField('Sala', max_length=50, blank=True, null=True)
    
    # Tipo de turma e relação com turma base
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES, default='base')
    turma_base = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='turmas_disciplina',
        blank=True,
        null=True,
        verbose_name='Turma Base'
    )
    
    alunos = models.ManyToManyField(
        Aluno,
        related_name='turma_alunos',
        blank=True,
        verbose_name='Alunos'
    )
    
    horarios = models.JSONField('Horários', default=dict, blank=True)
    dias_letivos = models.JSONField('Dias Letivos', default=list, blank=True)
    
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='ativa')
    
    # Metadata
    criado_em = models.DateTimeField('Criado em', default=timezone.now)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Turma'
        verbose_name_plural = 'Turmas'
        ordering = ['nome']
        unique_together = [['nome', 'ano']]
    
    def __str__(self):
        return f"{self.nome} - {self.ano} ({self.turno})"
    
    @property
    def total_alunos(self):
        """Get total number of students"""
        return self.alunos.count()


class Autorizacao(models.Model):
    """Model for authorizations"""
    
    TIPO_CHOICES = [
        ('saida_antecipada', 'Saída Antecipada'),
        ('ausencia', 'Ausência'),
        ('atividade_externa', 'Atividade Externa'),
        ('outro', 'Outro'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovada', 'Aprovada'),
        ('rejeitada', 'Rejeitada'),
    ]
    
    turma = models.ForeignKey(
        Turma,
        on_delete=models.CASCADE,
        related_name='autorizacoes',
        verbose_name='Turma'
    )
    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        related_name='autorizacoes',
        verbose_name='Aluno'
    )
    
    tipo = models.CharField('Tipo', max_length=50, choices=TIPO_CHOICES)
    data = models.DateField('Data')
    motivo = models.TextField('Motivo')
    observacoes = models.TextField('Observações', blank=True, null=True)
    
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='pendente')
    
    # Metadata
    criado_em = models.DateTimeField('Criado em', default=timezone.now)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Autorização'
        verbose_name_plural = 'Autorizações'
        ordering = ['-data', '-criado_em']
    
    def __str__(self):
        return f"{self.tipo} - {self.aluno.nome} - {self.data}"
