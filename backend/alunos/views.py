from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Aluno
from .serializers import AlunoSerializer

class AlunoViewSet(viewsets.ModelViewSet):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer

    @action(detail=False, methods=['post'], url_path="novo")
    def criar_aluno(self, request):
        """Cria um novo aluno usando a rota /api/alunos/novo/"""
        serializer = AlunoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):  # Atualizar aluno
        try:
            aluno = Aluno.objects.get(pk=pk)
            serializer = AlunoSerializer(aluno, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Aluno.DoesNotExist:
            return Response({"error": "Aluno não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):  # Excluir aluno
        try:
            aluno = Aluno.objects.get(pk=pk)
            aluno.delete()
            return Response({"message": "Aluno excluído com sucesso"}, status=status.HTTP_204_NO_CONTENT)
        except Aluno.DoesNotExist:
            return Response({"error": "Aluno não encontrado"}, status=status.HTTP_404_NOT_FOUND)
