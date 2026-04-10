from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Aluno

User = get_user_model()


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
    senha = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = Aluno
        fields = [
            'nome', 'matricula', 'email', 'data_nascimento',
            'telefone', 'endereco', 'responsavel', 'telefone_responsavel', 'senha'
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
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email já está em uso por outro usuário")
        return value

    def create(self, validated_data):
        senha = validated_data.pop('senha')

        with transaction.atomic():
            aluno = Aluno.objects.create(**validated_data)
            User.objects.create_user(
                email=aluno.email,
                nome=aluno.nome,
                matricula=aluno.matricula,
                telefone=aluno.telefone,
                data_nascimento=aluno.data_nascimento,
                endereco=aluno.endereco,
                password=senha,
                role='aluno',
            )

        return aluno


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

        user_qs = User.objects.filter(email=value).exclude(email=instance.email)
        if user_qs.exists():
            raise serializers.ValidationError("Email já está em uso por outro usuário")

        return value

    def update(self, instance, validated_data):
        old_email = instance.email
        aluno = super().update(instance, validated_data)

        user = User.objects.filter(email=old_email, role='aluno').first()
        if user:
            user.email = aluno.email
            user.nome = aluno.nome
            user.matricula = aluno.matricula
            user.telefone = aluno.telefone
            user.data_nascimento = aluno.data_nascimento
            user.endereco = aluno.endereco
            user.save(update_fields=['email', 'nome', 'matricula', 'telefone', 'data_nascimento', 'endereco'])

        return aluno
