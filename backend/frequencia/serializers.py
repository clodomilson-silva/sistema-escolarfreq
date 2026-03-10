from rest_framework import serializers
from .models import Frequencia


class FrequenciaSerializer(serializers.ModelSerializer):
    """Serializer for Frequencia model"""
    aluno_nome = serializers.CharField(source='aluno.nome', read_only=True)
    aluno_matricula = serializers.CharField(source='aluno.matricula', read_only=True)
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    
    class Meta:
        model = Frequencia
        fields = [
            'id', 'turma', 'turma_nome', 'aluno', 'aluno_nome', 'aluno_matricula',
            'data', 'disciplina', 'status', 'observacoes',
            'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']


class FrequenciaCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Frequencia"""
    
    class Meta:
        model = Frequencia
        fields = ['turma', 'aluno', 'data', 'disciplina', 'status', 'observacoes']
    
    def validate(self, data):
        """Validate that aluno belongs to turma"""
        turma = data.get('turma')
        aluno = data.get('aluno')
        
        if not turma.alunos.filter(id=aluno.id).exists():
            raise serializers.ValidationError("O aluno não pertence a esta turma")
        
        return data
    
    def validate_data(self, value):
        """Validate date"""
        from datetime import date
        # Allow past dates and today, but not future dates
        if value > date.today():
            raise serializers.ValidationError("Data não pode ser no futuro")
        return value


class FrequenciaUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Frequencia"""
    
    class Meta:
        model = Frequencia
        fields = ['status', 'observacoes']


class FrequenciaBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating frequencias"""
    turma_id = serializers.IntegerField()
    data = serializers.DateField()
    disciplina = serializers.CharField(max_length=100)
    frequencias = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    
    def validate_data(self, value):
        """Validate date"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Data não pode ser no futuro")
        return value
    
    def validate_frequencias(self, value):
        """Validate frequencias list"""
        for freq in value:
            if 'aluno_id' not in freq:
                raise serializers.ValidationError("aluno_id é obrigatório em cada frequência")
            if 'status' not in freq:
                raise serializers.ValidationError("status é obrigatório em cada frequência")
            if freq['status'] not in ['presente', 'ausente', 'justificado']:
                raise serializers.ValidationError("status deve ser 'presente', 'ausente' ou 'justificado'")
        return value


class EstatisticasAlunoSerializer(serializers.Serializer):
    """Serializer for student statistics"""
    aluno_id = serializers.IntegerField()
    aluno_nome = serializers.CharField()
    total_aulas = serializers.IntegerField()
    presencas = serializers.IntegerField()
    ausencias = serializers.IntegerField()
    justificadas = serializers.IntegerField()
    percentual_presenca = serializers.FloatField()
