from django.db import models

# Create your models here.
class Autorizacao(models.Model):
    aluno = models.ForeignKey("alunos.Aluno", on_delete=models.CASCADE)
    motivo = models.TextField()
    data_hora = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Autorização para {self.aluno.nome}"
