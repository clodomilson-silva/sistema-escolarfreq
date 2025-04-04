from django.db import models
from alunos.models import Aluno
from django.utils import timezone


class Autorizacao(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    ]

    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    motivo = models.TextField()
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='entrada')
    data = models.DateField(default=timezone.now)
    hora = models.TimeField(default=timezone.now)
    criado_em = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.aluno.nome} - {self.tipo.title()} - {self.data} {self.hora}"
