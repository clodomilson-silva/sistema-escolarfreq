from django.db import models

class Aluno(models.Model):
    nome = models.CharField(max_length=100)
    matricula = models.CharField(max_length=20, unique=True)
    data_nascimento = models.DateField()
    email = models.EmailField(unique=True)
    
    def __str__(self):
        return self.nome
