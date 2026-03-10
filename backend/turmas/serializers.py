from rest_framework import serializers
from .models import Turma, Autorizacao
from alunos.serializers import AlunoSerializer


class TurmaSerializer(serializers.ModelSerializer):
    """Serializer for Turma model"""
    total_alunos = serializers.ReadOnlyField()
    alunos = AlunoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Turma
        fields = [
            'id', 'nome', 'ano', 'turno', 'disciplina', 'professor', 'sala',
            'alunos', 'total_alunos', 'horarios', 'dias_letivos', 'status',
            'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']


class TurmaListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing turmas"""
    total_alunos = serializers.ReadOnlyField()
    
    class Meta:
        model = Turma
        fields = [
            'id', 'nome', 'ano', 'turno', 'disciplina', 'professor', 'sala',
            'total_alunos', 'status', 'criado_em'
        ]


class TurmaCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Turma"""
    alunos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=__import__('alunos.models', fromlist=['Aluno']).Aluno.objects.all(),
        required=False
    )
    
    class Meta:
        model = Turma
        fields = [
            'nome', 'ano', 'turno', 'disciplina', 'professor', 'sala',
            'alunos', 'horarios', 'dias_letivos', 'status'
        ]
    
    def validate_nome(self, value):
        """Check if turma name already exists"""
        if Turma.objects.filter(nome=value).exists():
            raise serializers.ValidationError("Já existe uma turma com este nome")
        return value


class TurmaUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Turma"""
    alunos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=__import__('alunos.models', fromlist=['Aluno']).Aluno.objects.all(),
        required=False
    )
    
    class Meta:
        model = Turma
        fields = [
            'nome', 'ano', 'turno', 'disciplina', 'professor', 'sala',
            'alunos', 'horarios', 'dias_letivos', 'status'
        ]
    
    def validate_nome(self, value):
        """Check if turma name already exists (excluding current instance)"""
        instance = self.instance
        if Turma.objects.filter(nome=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError("Já existe uma turma com este nome")
        return value


class AutorizacaoSerializer(serializers.ModelSerializer):
    """Serializer for Autorizacao model"""
    aluno_nome = serializers.CharField(source='aluno.nome', read_only=True)
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    
    class Meta:
        model = Autorizacao
        fields = [
            'id', 'turma', 'turma_nome', 'aluno', 'aluno_nome',
            'tipo', 'data', 'motivo', 'observacoes', 'status',
            'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']


class AutorizacaoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Autorizacao"""
    
    class Meta:
        model = Autorizacao
        fields = ['turma', 'aluno', 'tipo', 'data', 'motivo', 'observacoes', 'status']
    
    def validate(self, data):
        """Validate that aluno belongs to turma"""
        turma = data.get('turma')
        aluno = data.get('aluno')
        
        if not turma.alunos.filter(id=aluno.id).exists():
            raise serializers.ValidationError("O aluno não pertence a esta turma")
        
        return data
