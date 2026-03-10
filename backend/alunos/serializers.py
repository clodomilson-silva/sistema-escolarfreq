from rest_framework import serializers
from .models import Aluno


class AlunoSerializer(serializers.ModelSerializer):
    """Serializer for Aluno model"""
    idade = serializers.ReadOnlyField()
    
    class Meta:
        model = Aluno
        fields = [
            'id', 'nome', 'matricula', 'email', 'data_nascimento',
            'telefone', 'endereco', 'responsavel', 'telefone_responsavel',
            'idade', 'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']
    
    def validate_data_nascimento(self, value):
        """Validate birth date"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Data de nascimento não pode ser no futuro")
        return value


class AlunoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Aluno"""
    
    class Meta:
        model = Aluno
        fields = [
            'nome', 'matricula', 'email', 'data_nascimento',
            'telefone', 'endereco', 'responsavel', 'telefone_responsavel'
        ]
    
    def validate_matricula(self, value):
        """Check if matricula already exists"""
        if Aluno.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Matrícula já existe")
        return value
    
    def validate_email(self, value):
        """Check if email already exists"""
        if Aluno.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email já está em uso")
        return value


class AlunoUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Aluno"""
    
    class Meta:
        model = Aluno
        fields = [
            'nome', 'email', 'data_nascimento',
            'telefone', 'endereco', 'responsavel', 'telefone_responsavel'
        ]
    
    def validate_email(self, value):
        """Check if email already exists (excluding current instance)"""
        instance = self.instance
        if Aluno.objects.filter(email=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError("Email já está em uso")
        return value
