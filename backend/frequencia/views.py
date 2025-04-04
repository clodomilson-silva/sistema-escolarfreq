from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import Frequencia
from .serializers import FrequenciaSerializer

class FrequenciaViewSet(viewsets.ModelViewSet):
    queryset = Frequencia.objects.all()
    serializer_class = FrequenciaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['aluno__nome', 'turma__nome', 'data']
