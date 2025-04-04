from django.db import models
from alunos.models import Aluno
from turmas.models import Turma

class Frequencia(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE)
    data = models.DateField()
    presente = models.BooleanField(default=True)

    class Meta:
        unique_together = ('aluno', 'data', 'turma')

    def __str__(self):
        return f"{self.aluno.nome} - {self.data} - {'Presente' if self.presente else 'Faltou'}"
