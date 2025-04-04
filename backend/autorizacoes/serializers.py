from rest_framework import serializers
from .models import Autorizacao

class AutorizacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Autorizacao
        fields = ['id', 'aluno', 'motivo', 'tipo', 'data_hora']