from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import Autorizacao
from .serializers import AutorizacaoSerializer

class AutorizacaoViewSet(viewsets.ModelViewSet):
    queryset = Autorizacao.objects.all()
    serializer_class = AutorizacaoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['aluno__nome', 'data', 'tipo']
