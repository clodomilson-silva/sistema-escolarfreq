from django.db import models
from django.utils import timezone
from alunos.models import Aluno
from turmas.models import Turma


class Frequencia(models.Model):
    """Model for attendance tracking"""
    
    STATUS_CHOICES = [
        ('presente', 'Presente'),
        ('ausente', 'Ausente'),
        ('justificado', 'Justificado'),
    ]
    
    turma = models.ForeignKey(
        Turma,
        on_delete=models.CASCADE,
        related_name='frequencias',
        verbose_name='Turma'
    )
    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        related_name='frequencias',
        verbose_name='Aluno'
    )
    
    data = models.DateField('Data')
    disciplina = models.CharField('Disciplina', max_length=100)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='presente')
    observacoes = models.TextField('Observações', blank=True, null=True)
    
    # Metadata
    criado_em = models.DateTimeField('Criado em', default=timezone.now)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Frequência'
        verbose_name_plural = 'Frequências'
        ordering = ['-data', 'turma', 'aluno']
        unique_together = [['turma', 'aluno', 'data', 'disciplina']]
    
    def __str__(self):
        return f"{self.aluno.nome} - {self.turma.nome} - {self.data} ({self.status})"
