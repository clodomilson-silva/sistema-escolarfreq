from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Turma, Autorizacao, Avaliacao, Nota
from .serializers import (
    TurmaSerializer,
    TurmaListSerializer,
    TurmaCreateSerializer,
    TurmaUpdateSerializer,
    AutorizacaoSerializer,
    AutorizacaoCreateSerializer,
    AvaliacaoSerializer,
    AvaliacaoCreateSerializer,
    NotaSerializer,
    NotaCreateSerializer,
    NotaBatchSerializer
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
    
    @action(detail=True, methods=['get'])
    def verificar_conclusao(self, request, pk=None):
        """
        Verifica se a turma pode ser concluída
        GET /api/turmas/{id}/verificar_conclusao/
        
        Retorna:
        - pode_concluir: bool
        - motivos: lista de motivos impedindo a conclusão
        - estatisticas: estatísticas de preenchimento
        """
        from datetime import date
        from frequencia.models import Frequencia
        
        turma = self.get_object()
        motivos = []
        pode_concluir = True
        
        # Verificar se é turma disciplina
        if turma.tipo != 'disciplina':
            return Response({
                'success': True,
                'data': {
                    'pode_concluir': False,
                    'motivos': ['Apenas turmas-disciplina podem ser concluídas'],
                    'estatisticas': {}
                }
            })
        
        # Verificar se tem data de fim definida
        if not turma.data_fim:
            motivos.append('Turma não possui data de fim definida')
            pode_concluir = False
        
        # Verificar se a data de fim já passou
        if turma.data_fim and turma.data_fim > date.today():
            motivos.append(f'Data de fim ainda não chegou ({turma.data_fim.strftime("%d/%m/%Y")})')
            pode_concluir = False
        
        # Verificar se já está concluída
        if turma.status == 'concluida':
            return Response({
                'success': True,
                'data': {
                    'pode_concluir': False,
                    'motivos': ['Turma já está concluída'],
                    'estatisticas': {}
                }
            })
        
        # Contar alunos
        total_alunos = turma.alunos.count()
        if total_alunos == 0:
            motivos.append('Turma não possui alunos matriculados')
            pode_concluir = False
        
        # Verificar avaliações
        avaliacoes = Avaliacao.objects.filter(turma=turma)
        total_avaliacoes = avaliacoes.count()
        
        if total_avaliacoes == 0 and pode_concluir:
            motivos.append('Nenhuma avaliação cadastrada')
            pode_concluir = False
        
        # Verificar notas
        notas_esperadas = total_avaliacoes * total_alunos
        notas_cadastradas = Nota.objects.filter(avaliacao__turma=turma).count()
        
        percentual_notas = (notas_cadastradas / notas_esperadas * 100) if notas_esperadas > 0 else 0
        
        if notas_cadastradas < notas_esperadas and pode_concluir:
            motivos.append(
                f'Nem todos os alunos possuem notas em todas as avaliações '
                f'({notas_cadastradas}/{notas_esperadas} - {percentual_notas:.1f}%)'
            )
            pode_concluir = False
        
        # Verificar frequências (apenas se houver data_inicio e data_fim)
        frequencias_info = {}
        if turma.data_inicio and turma.data_fim:
            # Calcular dias letivos estimados (considerando dias úteis)
            from datetime import timedelta
            dias_corridos = (turma.data_fim - turma.data_inicio).days + 1
            # Estimativa: ~70% dos dias são letivos (excluindo fins de semana e feriados)
            dias_letivos_estimados = int(dias_corridos * 0.7)
            
            # Contar frequências únicas por aluno por data
            frequencias_cadastradas = Frequencia.objects.filter(
                turma=turma,
                data__gte=turma.data_inicio,
                data__lte=turma.data_fim
            ).values('aluno', 'data').distinct().count()
            
            frequencias_esperadas = dias_letivos_estimados * total_alunos
            percentual_frequencias = (frequencias_cadastradas / frequencias_esperadas * 100) if frequencias_esperadas > 0 else 0
            
            frequencias_info = {
                'cadastradas': frequencias_cadastradas,
                'esperadas': frequencias_esperadas,
                'percentual': round(percentual_frequencias, 1),
                'dias_letivos_estimados': dias_letivos_estimados
            }
            
            if frequencias_cadastradas < frequencias_esperadas * 0.9 and pode_concluir:  # Tolerância de 10%
                motivos.append(
                    f'Frequências incompletas: {frequencias_cadastradas}/{frequencias_esperadas} '
                    f'({percentual_frequencias:.1f}%) - mínimo 90% necessário'
                )
                pode_concluir = False
        else:
            motivos.append('Turma não possui data de início ou fim definidas')
            pode_concluir = False
        
        estatisticas = {
            'total_alunos': total_alunos,
            'total_avaliacoes': total_avaliacoes,
            'notas': {
                'cadastradas': notas_cadastradas,
                'esperadas': notas_esperadas,
                'percentual': round(percentual_notas, 1)
            },
            'frequencias': frequencias_info
        }
        
        return Response({
            'success': True,
            'data': {
                'pode_concluir': pode_concluir,
                'motivos': motivos if not pode_concluir else [],
                'estatisticas': estatisticas
            }
        })
    
    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        """
        Conclui a turma após validações
        POST /api/turmas/{id}/concluir/
        """
        turma = self.get_object()
        
        # Verificar se pode concluir
        verificacao_response = self.verificar_conclusao(request, pk)
        verificacao_data = verificacao_response.data['data']
        
        if not verificacao_data['pode_concluir']:
            return Response({
                'success': False,
                'error': 'Turma não pode ser concluída',
                'motivos': verificacao_data['motivos'],
                'estatisticas': verificacao_data['estatisticas']
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Concluir turma
        turma.status = 'concluida'
        turma.save()
        
        return Response({
            'success': True,
            'data': TurmaSerializer(turma).data,
            'message': f'Turma {turma.nome} concluída com sucesso!',
            'estatisticas': verificacao_data['estatisticas']
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


class AvaliacaoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Avaliacao model
    
    list: GET /api/turmas/avaliacoes/
    retrieve: GET /api/turmas/avaliacoes/{id}/
    create: POST /api/turmas/avaliacoes/
    update: PUT /api/turmas/avaliacoes/{id}/
    partial_update: PATCH /api/turmas/avaliacoes/{id}/
    destroy: DELETE /api/turmas/avaliacoes/{id}/
    """
    queryset = Avaliacao.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AvaliacaoCreateSerializer
        return AvaliacaoSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Avaliacao.objects.all()
        
        # Filter by turma
        turma_id = self.request.query_params.get('turma_id', None)
        if turma_id:
            queryset = queryset.filter(turma_id=turma_id)
        
        # Filter by tipo
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        # Filter by date range
        data_inicio = self.request.query_params.get('data_inicio', None)
        data_fim = self.request.query_params.get('data_fim', None)
        if data_inicio:
            queryset = queryset.filter(data__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data__lte=data_fim)
        
        return queryset.order_by('-data')
    
    def list(self, request, *args, **kwargs):
        """List all avaliacoes with custom response format"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count(),
            'message': f'{queryset.count()} avaliação(ões) encontrada(s)'
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single avaliacao with custom response format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Avaliação encontrada'
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new avaliacao with custom response format"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'data': AvaliacaoSerializer(serializer.instance).data,
            'message': 'Avaliação criada com sucesso'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update an avaliacao with custom response format"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': AvaliacaoSerializer(serializer.instance).data,
            'message': 'Avaliação atualizada com sucesso'
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete an avaliacao with custom response format"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Avaliação removida com sucesso'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def notas(self, request, pk=None):
        """Get all notas for this avaliacao"""
        avaliacao = self.get_object()
        notas = avaliacao.notas.all()
        serializer = NotaSerializer(notas, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': notas.count(),
            'message': f'{notas.count()} nota(s) encontrada(s)'
        })


class NotaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Nota model
    
    list: GET /api/turmas/notas/
    retrieve: GET /api/turmas/notas/{id}/
    create: POST /api/turmas/notas/
    update: PUT /api/turmas/notas/{id}/
    partial_update: PATCH /api/turmas/notas/{id}/
    destroy: DELETE /api/turmas/notas/{id}/
    """
    queryset = Nota.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return NotaCreateSerializer
        elif self.action == 'batch_create':
            return NotaBatchSerializer
        return NotaSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Nota.objects.all()
        
        # Filter by avaliacao
        avaliacao_id = self.request.query_params.get('avaliacao_id', None)
        if avaliacao_id:
            queryset = queryset.filter(avaliacao_id=avaliacao_id)
        
        # Filter by aluno
        aluno_id = self.request.query_params.get('aluno_id', None)
        if aluno_id:
            queryset = queryset.filter(aluno_id=aluno_id)
        
        # Filter by turma
        turma_id = self.request.query_params.get('turma_id', None)
        if turma_id:
            queryset = queryset.filter(avaliacao__turma_id=turma_id)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List all notas with custom response format"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count(),
            'message': f'{queryset.count()} nota(s) encontrada(s)'
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single nota with custom response format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Nota encontrada'
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new nota with custom response format"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'data': NotaSerializer(serializer.instance).data,
            'message': 'Nota criada com sucesso'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update a nota with custom response format"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': NotaSerializer(serializer.instance).data,
            'message': 'Nota atualizada com sucesso'
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete a nota with custom response format"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Nota removida com sucesso'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def batch_create(self, request):
        """Create or update multiple notas at once"""
        serializer = NotaBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        
        return Response({
            'success': True,
            'data': {
                'total_processadas': result['total_processadas'],
                'total_erros': result['total_erros'],
                'errors': result['errors']
            },
            'message': f'{result["total_processadas"]} nota(s) processada(s) com sucesso'
        }, status=status.HTTP_201_CREATED)
