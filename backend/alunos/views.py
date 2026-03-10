from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Aluno
from .serializers import AlunoSerializer, AlunoCreateSerializer, AlunoUpdateSerializer


class AlunoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Aluno model
    
    list: GET /api/alunos/
    retrieve: GET /api/alunos/{id}/
    create: POST /api/alunos/
    update: PUT /api/alunos/{id}/
    partial_update: PATCH /api/alunos/{id}/
    destroy: DELETE /api/alunos/{id}/
    """
    queryset = Aluno.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AlunoCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AlunoUpdateSerializer
        return AlunoSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Aluno.objects.all()
        
        # Filter by name
        nome = self.request.query_params.get('nome', None)
        if nome:
            queryset = queryset.filter(nome__icontains=nome)
        
        # Filter by matricula
        matricula = self.request.query_params.get('matricula', None)
        if matricula:
            queryset = queryset.filter(matricula=matricula)
        
        # Filter by turma_id (students in a specific class)
        turma_id = self.request.query_params.get('turma_id', None)
        if turma_id:
            # Get students that are in the specified turma
            queryset = queryset.filter(turma_alunos__id=turma_id).distinct()
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List all alunos with custom response format"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count(),
            'message': f'{queryset.count()} aluno(s) encontrado(s)'
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single aluno with custom response format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Aluno encontrado'
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new aluno with custom response format"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'data': AlunoSerializer(serializer.instance).data,
            'message': 'Aluno criado com sucesso'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update an aluno with custom response format"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': AlunoSerializer(serializer.instance).data,
            'message': 'Aluno atualizado com sucesso'
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete an aluno with custom response format"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Aluno removido com sucesso'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        Count total alunos
        GET /api/alunos/count/
        """
        total = self.get_queryset().count()
        
        return Response({
            'success': True,
            'data': {'total': total},
            'message': f'Total de {total} aluno(s) cadastrado(s)'
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search alunos by nome, matricula or email
        GET /api/alunos/search/?q=termo
        """
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({
                'success': False,
                'error': 'Parâmetro de busca "q" é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = Aluno.objects.filter(
            Q(nome__icontains=query) |
            Q(matricula__icontains=query) |
            Q(email__icontains=query)
        )
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count(),
            'message': f'{queryset.count()} aluno(s) encontrado(s)'
        })
