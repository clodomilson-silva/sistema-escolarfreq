from django.shortcuts import render
from rest_framework import viewsets
from .models import Autorizacao
from .serializers import AutorizacaoSerializer
from rest_framework.permissions import IsAuthenticated

class AutorizacaoViewSet(viewsets.ModelViewSet):
    queryset = Autorizacao.objects.all()
    serializer_class = AutorizacaoSerializer
    permission_classes = [IsAuthenticated]