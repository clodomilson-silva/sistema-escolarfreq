from django.db import models

class Turma(models.Model):
    nome = models.CharField(max_length=100)
    ano = models.IntegerField()
    turno = models.CharField(
        max_length=10,
        choices=[("Manhã", "Manhã"), ("Tarde", "Tarde"), ("Noite", "Noite")],
        null = True
    )

    def __str__(self):
        return f"{self.nome} - {self.ano} ({self.turno})"
