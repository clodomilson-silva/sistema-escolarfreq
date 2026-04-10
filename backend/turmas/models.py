from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from alunos.models import Aluno

User = get_user_model()


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

    NIVEL_ENSINO_CHOICES = [
        ('fundamental', 'Ensino Fundamental'),
        ('medio', 'Ensino Medio'),
        ('tecnico', 'Curso Tecnico'),
        ('profissionalizante', 'Curso Profissionalizante'),
    ]
    
    nome = models.CharField('Nome', max_length=100, unique=True)
    ano = models.IntegerField('Ano')
    turno = models.CharField('Turno', max_length=20, choices=TURNO_CHOICES)
    disciplina = models.CharField('Disciplina', max_length=100, blank=True, default='Geral')
    professor = models.CharField('Professor', max_length=255, blank=True, null=True)
    professor_usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='turmas_alocadas',
        blank=True,
        null=True,
        limit_choices_to={'role': 'professor'},
        verbose_name='Professor (Cadastro)'
    )
    sala = models.CharField('Sala', max_length=50, blank=True, null=True)
    
    # Tipo de turma e relação com turma base
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES, default='base')
    nivel_ensino = models.CharField(
        'Nivel de Ensino',
        max_length=20,
        choices=NIVEL_ENSINO_CHOICES,
        default='fundamental'
    )
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
    
    # Período letivo (para turmas-disciplina)
    data_inicio = models.DateField('Data de Início', blank=True, null=True)
    data_fim = models.DateField('Data de Término', blank=True, null=True)
    
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


class Avaliacao(models.Model):
    """Model for evaluations/assessments"""
    
    TIPO_CHOICES = [
        ('prova', 'Prova'),
        ('trabalho', 'Trabalho'),
        ('atividade', 'Atividade'),
        ('projeto', 'Projeto'),
        ('seminario', 'Seminário'),
        ('participacao', 'Participação'),
        ('outro', 'Outro'),
    ]
    
    turma = models.ForeignKey(
        Turma,
        on_delete=models.CASCADE,
        related_name='avaliacoes',
        verbose_name='Turma'
    )
    
    descricao = models.CharField('Descrição', max_length=255)
    tipo = models.CharField('Tipo', max_length=50, choices=TIPO_CHOICES, default='prova')
    data = models.DateField('Data')
    peso = models.DecimalField('Peso', max_digits=5, decimal_places=2, default=1.0)
    nota_maxima = models.DecimalField('Nota Máxima', max_digits=5, decimal_places=2, default=10.0)
    observacoes = models.TextField('Observações', blank=True, null=True)
    
    # Metadata
    criado_em = models.DateTimeField('Criado em', default=timezone.now)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Avaliação'
        verbose_name_plural = 'Avaliações'
        ordering = ['-data', 'descricao']
    
    def __str__(self):
        return f"{self.descricao} - {self.turma.nome} ({self.data})"


class Nota(models.Model):
    """Model for student grades"""
    
    avaliacao = models.ForeignKey(
        Avaliacao,
        on_delete=models.CASCADE,
        related_name='notas',
        verbose_name='Avaliação'
    )
    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        related_name='notas',
        verbose_name='Aluno'
    )
    
    valor = models.DecimalField('Nota', max_digits=5, decimal_places=2)
    observacoes = models.TextField('Observações', blank=True, null=True)
    
    # Metadata
    criado_em = models.DateTimeField('Criado em', default=timezone.now)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Nota'
        verbose_name_plural = 'Notas'
        ordering = ['aluno__nome']
        unique_together = [['avaliacao', 'aluno']]
    
    def __str__(self):
        return f"{self.aluno.nome} - {self.avaliacao.descricao} - {self.valor}"
