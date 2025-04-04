from django.test import TestCase
from alunos.models import Aluno
from .models import Autorizacao

class AutorizacaoTestCase(TestCase):
    def setUp(self):
        self.aluno = Aluno.objects.create(
            nome="João Silva",
            matricula="12345",
            data_nascimento="2005-05-15",
            email="joao.silva@example.com"
        )

    def test_criar_autorizacao(self):
        autorizacao = Autorizacao.objects.create(
            aluno=self.aluno,
            motivo="Chegou atrasado devido ao trânsito",
            tipo="entrada"
        )
        self.assertEqual(autorizacao.aluno.nome, "João Silva")
        self.assertEqual(autorizacao.tipo, "entrada")