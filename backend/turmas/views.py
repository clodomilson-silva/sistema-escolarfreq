from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Turma, Autorizacao
from .serializers import (
    TurmaSerializer,
    TurmaListSerializer,
    TurmaCreateSerializer,
    TurmaUpdateSerializer,
    AutorizacaoSerializer,
    AutorizacaoCreateSerializer
)


class TurmaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Turma model
    
    list: GET /api/turmas/
    retrieve: GET /api/turmas/{id}/
    create: POST /api/turmas/
    update: PUT /api/turmas/{id}/
    partial_update: PATCH /api/turmas/{id}/
    destroy: DELETE /api/turmas/{id}/
    """
    queryset = Turma.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TurmaListSerializer
        elif self.action == 'create':
            return TurmaCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TurmaUpdateSerializer
        return TurmaSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Turma.objects.all()
        
        # Filter by ano
        ano = self.request.query_params.get('ano', None)
        if ano:
            queryset = queryset.filter(ano=ano)
        
        # Filter by turno
        turno = self.request.query_params.get('turno', None)
        if turno:
            queryset = queryset.filter(turno=turno)
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List all turmas with custom response format"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count(),
            'message': f'{queryset.count()} turma(s) encontrada(s)'
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single turma with custom response format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Turma encontrada'
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new turma with custom response format"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'data': TurmaSerializer(serializer.instance).data,
            'message': 'Turma criada com sucesso'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update a turma with custom response format"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': TurmaSerializer(serializer.instance).data,
            'message': 'Turma atualizada com sucesso'
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete a turma with custom response format"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Turma removida com sucesso'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def add_aluno(self, request, pk=None):
        """
        Add aluno to turma
        POST /api/turmas/{id}/add_aluno/
        Body: {"aluno_id": 123}
        """
        turma = self.get_object()
        aluno_id = request.data.get('aluno_id')
        
        if not aluno_id:
            return Response({
                'success': False,
                'error': 'aluno_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from alunos.models import Aluno
            aluno = Aluno.objects.get(id=aluno_id)
            turma.alunos.add(aluno)
            
            return Response({
                'success': True,
                'data': TurmaSerializer(turma).data,
                'message': f'Aluno {aluno.nome} adicionado à turma'
            })
        except Aluno.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Aluno não encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def remove_aluno(self, request, pk=None):
        """
        Remove aluno from turma
        POST /api/turmas/{id}/remove_aluno/
        Body: {"aluno_id": 123}
        """
        turma = self.get_object()
        aluno_id = request.data.get('aluno_id')
        
        if not aluno_id:
            return Response({
                'success': False,
                'error': 'aluno_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from alunos.models import Aluno
            aluno = Aluno.objects.get(id=aluno_id)
            turma.alunos.remove(aluno)
            
            return Response({
                'success': True,
                'data': TurmaSerializer(turma).data,
                'message': f'Aluno {aluno.nome} removido da turma'
            })
        except Aluno.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Aluno não encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        Count total turmas
        GET /api/turmas/count/
        """
        total = self.get_queryset().count()
        
        return Response({
            'success': True,
            'data': {'total': total},
            'message': f'Total de {total} turma(s) cadastrada(s)'
        })


class AutorizacaoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Autorizacao model
    
    list: GET /api/turmas/autorizacoes/
    retrieve: GET /api/turmas/autorizacoes/{id}/
    create: POST /api/turmas/autorizacoes/
    update: PUT /api/turmas/autorizacoes/{id}/
    partial_update: PATCH /api/turmas/autorizacoes/{id}/
    destroy: DELETE /api/turmas/autorizacoes/{id}/
    """
    queryset = Autorizacao.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AutorizacaoCreateSerializer
        return AutorizacaoSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Autorizacao.objects.all()
        
        # Filter by turma
        turma_id = self.request.query_params.get('turma_id', None)
        if turma_id:
            queryset = queryset.filter(turma_id=turma_id)
        
        # Filter by aluno
        aluno_id = self.request.query_params.get('aluno_id', None)
        if aluno_id:
            queryset = queryset.filter(aluno_id=aluno_id)
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by tipo
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List all autorizacoes with custom response format"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count(),
            'message': f'{queryset.count()} autorização(ões) encontrada(s)'
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single autorizacao with custom response format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Autorização encontrada'
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new autorizacao with custom response format"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'data': AutorizacaoSerializer(serializer.instance).data,
            'message': 'Autorização criada com sucesso'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update an autorizacao with custom response format"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': AutorizacaoSerializer(serializer.instance).data,
            'message': 'Autorização atualizada com sucesso'
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete an autorizacao with custom response format"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Autorização removida com sucesso'
        }, status=status.HTTP_200_OK)
