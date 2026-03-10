from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from .models import Frequencia
from alunos.models import Aluno
from turmas.models import Turma
from .serializers import (
    FrequenciaSerializer,
    FrequenciaCreateSerializer,
    FrequenciaUpdateSerializer,
    FrequenciaBulkCreateSerializer,
    EstatisticasAlunoSerializer
)


class FrequenciaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Frequencia model
    
    list: GET /api/frequencia/
    retrieve: GET /api/frequencia/{id}/
    create: POST /api/frequencia/
    update: PUT /api/frequencia/{id}/
    partial_update: PATCH /api/frequencia/{id}/
    destroy: DELETE /api/frequencia/{id}/
    """
    queryset = Frequencia.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FrequenciaCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return FrequenciaUpdateSerializer
        return FrequenciaSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Frequencia.objects.all()
        
        # Filter by turma
        turma_id = self.request.query_params.get('turma_id', None)
        if turma_id:
            queryset = queryset.filter(turma_id=turma_id)
        
        # Filter by aluno
        aluno_id = self.request.query_params.get('aluno_id', None)
        if aluno_id:
            queryset = queryset.filter(aluno_id=aluno_id)
        
        # Filter by data
        data = self.request.query_params.get('data', None)
        if data:
            queryset = queryset.filter(data=data)
        
        # Filter by disciplina
        disciplina = self.request.query_params.get('disciplina', None)
        if disciplina:
            queryset = queryset.filter(disciplina__icontains=disciplina)
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List all frequencias with custom response format"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count(),
            'message': f'{queryset.count()} registro(s) de frequência encontrado(s)'
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single frequencia with custom response format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Frequência encontrada'
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new frequencia with custom response format"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if frequencia already exists
        turma = serializer.validated_data['turma']
        aluno = serializer.validated_data['aluno']
        data = serializer.validated_data['data']
        disciplina = serializer.validated_data['disciplina']
        
        existing = Frequencia.objects.filter(
            turma=turma,
            aluno=aluno,
            data=data,
            disciplina=disciplina
        ).first()
        
        if existing:
            # Update existing frequencia
            update_serializer = FrequenciaUpdateSerializer(
                existing,
                data=request.data,
                partial=True
            )
            update_serializer.is_valid(raise_exception=True)
            update_serializer.save()
            
            return Response({
                'success': True,
                'data': FrequenciaSerializer(existing).data,
                'message': 'Frequência atualizada com sucesso'
            })
        
        # Create new frequencia
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'data': FrequenciaSerializer(serializer.instance).data,
            'message': 'Frequência registrada com sucesso'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update a frequencia with custom response format"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': FrequenciaSerializer(serializer.instance).data,
            'message': 'Frequência atualizada com sucesso'
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete a frequencia with custom response format"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Frequência removida com sucesso'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Bulk create frequencias for a turma
        POST /api/frequencia/bulk_create/
        Body: {
            "turma_id": 1,
            "data": "2024-03-10",
            "disciplina": "Matemática",
            "frequencias": [
                {"aluno_id": 1, "status": "presente"},
                {"aluno_id": 2, "status": "ausente", "observacoes": "Faltou"}
            ]
        }
        """
        # Log detalhado para debug
        print("\n=== DEBUG BULK_CREATE ===")
        print(f"Request data: {request.data}")
        print(f"Request data type: {type(request.data)}")
        
        serializer = FrequenciaBulkCreateSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"❌ Validation errors: {serializer.errors}")
            return Response({
                'success': False,
                'errors': serializer.errors,
                'message': 'Erro de validação'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"✅ Data validated successfully")
        print(f"✅ Data validated successfully")
        
        turma_id = serializer.validated_data['turma_id']
        data = serializer.validated_data['data']
        disciplina = serializer.validated_data['disciplina']
        frequencias_data = serializer.validated_data['frequencias']
        
        print(f"Turma ID: {turma_id} (type: {type(turma_id)})")
        print(f"Data: {data}")
        print(f"Disciplina: {disciplina}")
        print(f"Frequências: {frequencias_data}")
        
        # Get turma
        turma = get_object_or_404(Turma, id=turma_id)
        print(f"✅ Turma encontrada: {turma.nome}")
        print(f"Alunos na turma: {list(turma.alunos.values_list('id', flat=True))}")
        
        # Create or update frequencias
        created_count = 0
        updated_count = 0
        
        for freq_data in frequencias_data:
            aluno_id = freq_data['aluno_id']
            status_value = freq_data['status']
            observacoes = freq_data.get('observacoes', '')
            
            print(f"\n➡️ Processando aluno_id: {aluno_id} (type: {type(aluno_id)})")
            
            # Get aluno
            try:
                aluno = get_object_or_404(Aluno, id=aluno_id)
                print(f"✅ Aluno encontrado: {aluno.nome}")
            except Exception as e:
                print(f"❌ Erro ao buscar aluno {aluno_id}: {e}")
                continue
            
            # Check if aluno belongs to turma
            if not turma.alunos.filter(id=aluno_id).exists():
                print(f"⚠️ Aluno {aluno.nome} (ID: {aluno_id}) NÃO pertence à turma {turma.nome}")
                continue
            
            print(f"✅ Aluno {aluno.nome} pertence à turma")
            print(f"✅ Aluno {aluno.nome} pertence à turma")
            
            # Create or update frequencia
            freq, created = Frequencia.objects.update_or_create(
                turma=turma,
                aluno=aluno,
                data=data,
                disciplina=disciplina,
                defaults={
                    'status': status_value,
                    'observacoes': observacoes
                }
            )
            
            if created:
                created_count += 1
                print(f"✅ Frequência CRIADA para {aluno.nome}")
            else:
                updated_count += 1
                print(f"✅ Frequência ATUALIZADA para {aluno.nome}")
        
        print(f"\n=== RESULTADO ===")
        print(f"Criados: {created_count}")
        print(f"Atualizados: {updated_count}")
        print("=" * 50 + "\n")
        
        return Response({
            'success': True,
            'data': {
                'created': created_count,
                'updated': updated_count,
                'total': created_count + updated_count
            },
            'message': f'{created_count} registros criados, {updated_count} atualizados'
        })
    
    @action(detail=False, methods=['get'])
    def turma(self, request):
        """
        Get frequencias by turma and date
        GET /api/frequencia/turma/?turma_id=1&data=2024-03-10
        """
        turma_id = request.query_params.get('turma_id')
        data = request.query_params.get('data')
        
        if not turma_id or not data:
            return Response({
                'success': False,
                'error': 'turma_id e data são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        frequencias = Frequencia.objects.filter(
            turma_id=turma_id,
            data=data
        )
        
        serializer = FrequenciaSerializer(frequencias, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': frequencias.count()
        })
    
    @action(detail=False, methods=['get'])
    def aluno(self, request):
        """
        Get frequencias by aluno
        GET /api/frequencia/aluno/?aluno_id=1
        """
        aluno_id = request.query_params.get('aluno_id')
        
        if not aluno_id:
            return Response({
                'success': False,
                'error': 'aluno_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get filters
        turma_id = request.query_params.get('turma_id')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        frequencias = Frequencia.objects.filter(aluno_id=aluno_id)
        
        if turma_id:
            frequencias = frequencias.filter(turma_id=turma_id)
        if data_inicio:
            frequencias = frequencias.filter(data__gte=data_inicio)
        if data_fim:
            frequencias = frequencias.filter(data__lte=data_fim)
        
        serializer = FrequenciaSerializer(frequencias, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'total': frequencias.count()
        })
    
    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """
        Get attendance statistics for a student
        GET /api/frequencia/estatisticas/?aluno_id=1
        """
        aluno_id = request.query_params.get('aluno_id')
        
        if not aluno_id:
            return Response({
                'success': False,
                'error': 'aluno_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        aluno = get_object_or_404(Aluno, id=aluno_id)
        
        # Get filters
        turma_id = request.query_params.get('turma_id')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        frequencias = Frequencia.objects.filter(aluno_id=aluno_id)
        
        if turma_id:
            frequencias = frequencias.filter(turma_id=turma_id)
        if data_inicio:
            frequencias = frequencias.filter(data__gte=data_inicio)
        if data_fim:
            frequencias = frequencias.filter(data__lte=data_fim)
        
        # Calculate statistics
        total_aulas = frequencias.count()
        presencas = frequencias.filter(status='presente').count()
        ausencias = frequencias.filter(status='ausente').count()
        justificadas = frequencias.filter(status='justificado').count()
        
        percentual_presenca = (presencas / total_aulas * 100) if total_aulas > 0 else 0
        
        stats = {
            'aluno_id': aluno.id,
            'aluno_nome': aluno.nome,
            'total_aulas': total_aulas,
            'presencas': presencas,
            'ausencias': ausencias,
            'justificadas': justificadas,
            'percentual_presenca': round(percentual_presenca, 2)
        }
        
        return Response({
            'success': True,
            'data': stats
        })
