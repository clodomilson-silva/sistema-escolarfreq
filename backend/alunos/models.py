from django.db import models
from django.core.validators import EmailValidator
from django.utils import timezone


class Aluno(models.Model):
    """Model for students"""
    
    nome = models.CharField('Nome', max_length=255)
    matricula = models.CharField('Matrícula', max_length=50, unique=True)
    email = models.EmailField('Email', validators=[EmailValidator()], unique=True)
    data_nascimento = models.DateField('Data de Nascimento')
    telefone = models.CharField('Telefone', max_length=20, blank=True, null=True)
    endereco = models.TextField('Endereço', blank=True, null=True)
    responsavel = models.CharField('Responsável', max_length=255, blank=True, null=True)
    telefone_responsavel = models.CharField('Telefone Responsável', max_length=20, blank=True, null=True)
    
    # Metadata
    criado_em = models.DateTimeField('Criado em', default=timezone.now)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Aluno'
        verbose_name_plural = 'Alunos'
        ordering = ['nome']
    
    def __str__(self):
        return f"{self.nome} ({self.matricula})"
    
    @property
    def idade(self):
        """Calculate student age"""
        from datetime import date
        today = date.today()
        return today.year - self.data_nascimento.year - (
            (today.month, today.day) < (self.data_nascimento.month, self.data_nascimento.day)
        )
