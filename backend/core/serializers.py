from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'nome', 'role', 'disciplinas', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users"""
    senha = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'nome', 'senha', 'role', 'disciplinas']
    
    def create(self, validated_data):
        senha = validated_data.pop('senha')
        user = User.objects.create_user(password=senha, **validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['nome'] = user.nome
        token['role'] = user.role
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra responses
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'nome': self.user.nome,
            'role': self.user.role,
            'disciplinas': self.user.disciplinas,
        }
        
        return data


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True, style={'input_type': 'password'})


class RegisterSerializer(serializers.Serializer):
    """Register serializer"""
    email = serializers.EmailField()
    nome = serializers.CharField(max_length=255)
    senha = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=['admin', 'professor'], default='professor')
    disciplinas = serializers.ListField(child=serializers.CharField(), required=False, default=list)
