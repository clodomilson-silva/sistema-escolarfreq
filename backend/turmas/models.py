from django.db import models
from alunos.models import Aluno

class Turma(models.Model):
    nome = models.CharField(max_length=100)
    ano = models.IntegerField()
    turno = models.CharField(
        max_length=10,
        choices=[("Manhã", "Manhã"), ("Tarde", "Tarde"), ("Noite", "Noite")],
        null=True
    )
    alunos = models.ManyToManyField(Aluno, related_name="turmas", blank=True)

    def adicionar_aluno(self, aluno):
        if self.alunos.count() >= 20:
            raise ValueError("A turma já atingiu o limite máximo de 20 alunos.")
        self.alunos.add(aluno)

    def __str__(self):
        return f"{self.nome} - {self.ano} ({self.turno})"