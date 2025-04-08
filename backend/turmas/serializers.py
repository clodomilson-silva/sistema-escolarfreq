from rest_framework import serializers
from .models import Turma
from alunos.models import Aluno

class AlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aluno
        fields = ['id', 'nome', 'matricula']

class TurmaSerializer(serializers.ModelSerializer):
    alunos = AlunoSerializer(many=True, read_only=True)
    alunos_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Turma
        fields = ['id', 'nome', 'ano', 'turno', 'alunos', 'alunos_ids']

    def update(self, instance, validated_data):
        alunos_ids = validated_data.pop('alunos_ids', [])
        for aluno_id in alunos_ids:
            aluno = Aluno.objects.get(id=aluno_id)
            instance.adicionar_aluno(aluno)
        return super().update(instance, validated_data)