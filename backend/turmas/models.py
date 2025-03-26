from django.db import models

# Create your models here.
class Turma(models.Model):
    nome = models.CharField(max_length=100)
    ano = models.IntegerField()
    
    def __str__(self):
        return f"{self.nome} - {self.ano}"
