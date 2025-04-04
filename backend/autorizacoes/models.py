from django.db import models

class Autorizacao(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    ]

    aluno = models.ForeignKey("alunos.Aluno", on_delete=models.CASCADE)
    motivo = models.TextField()
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='entrada')  # Valor padrão adicionado
    data_hora = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Autorização ({self.tipo}) para {self.aluno.nome}"