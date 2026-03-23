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
    
    @action(detail=True, methods=['get'])
    def boletim(self, request, pk=None):
        """
        Gerar boletim do aluno com notas e frequências
        GET /api/alunos/{id}/boletim/?turma_id={turma_disciplina_id}
        """
        from turmas.models import Turma, Avaliacao, Nota
        from frequencia.models import Frequencia
        from decimal import Decimal
        
        aluno = self.get_object()
        turma_id = request.query_params.get('turma_id')
        
        # Buscar turmas-disciplina vinculadas ao aluno
        turmas_disciplina = Turma.objects.filter(tipo='disciplina', alunos=aluno)

        # Se turma_id for informado, validar vínculo do aluno com a turma-disciplina
        if turma_id:
            turmas_disciplina = turmas_disciplina.filter(id=turma_id)
            if not turmas_disciplina.exists():
                return Response({
                    'success': False,
                    'error': 'Aluno não está vinculado à turma-disciplina informada.'
                }, status=status.HTTP_400_BAD_REQUEST)

        turmas_disciplina = turmas_disciplina.select_related('turma_base')
        
        boletim_data = {
            'aluno': {
                'id': aluno.id,
                'nome': aluno.nome,
                'matricula': aluno.matricula,
                'email': aluno.email
            },
            'periodo': {
                'data_inicio': None,
                'data_fim': None
            },
            'disciplinas': []
        }
        
        for turma_disc in turmas_disciplina:
            # Buscar todas as atividades cadastradas para a turma-disciplina
            avaliacoes_query = Avaliacao.objects.filter(turma=turma_disc)

            avaliacoes_query = avaliacoes_query.order_by('data', 'descricao')

            # Buscar notas do aluno para as atividades da turma
            notas_query = Nota.objects.filter(
                aluno=aluno,
                avaliacao__in=avaliacoes_query
            ).select_related('avaliacao')

            notas_por_avaliacao = {
                nota.avaliacao_id: nota for nota in notas_query
            }
            
            # Calcular média ponderada
            notas_list = []
            soma_valores = Decimal('0')
            soma_pesos = Decimal('0')
            
            for avaliacao in avaliacoes_query:
                nota = notas_por_avaliacao.get(avaliacao.id)
                notas_list.append({
                    'avaliacao': avaliacao.descricao,
                    'tipo': avaliacao.tipo,
                    'data': avaliacao.data,
                    'valor': float(nota.valor) if nota else None,
                    'nota_maxima': float(avaliacao.nota_maxima),
                    'peso': float(avaliacao.peso),
                    'observacoes': nota.observacoes if nota else None
                })

                # Média considera apenas avaliações que já possuem nota lançada
                if nota:
                    soma_valores += nota.valor * avaliacao.peso
                    soma_pesos += avaliacao.peso
            
            media = float(soma_valores / soma_pesos) if soma_pesos > 0 else 0.0
            total_notas_lancadas = sum(1 for item in notas_list if item['valor'] is not None)
            
            # Filtrar frequências da turma-disciplina
            freq_query = Frequencia.objects.filter(
                aluno=aluno,
                turma=turma_disc
            )
            
            # Estatísticas de frequência
            total_aulas = freq_query.count()
            presencas = freq_query.filter(status='presente').count()
            ausencias = freq_query.filter(status='ausente').count()
            justificadas = freq_query.filter(status='justificado').count()
            
            percentual_presenca = (presencas / total_aulas * 100) if total_aulas > 0 else 0.0
            
            disciplina_data = {
                'turma_id': turma_disc.id,
                'turma_nome': turma_disc.nome,
                'disciplina': turma_disc.disciplina,
                'professor': turma_disc.professor,
                'periodo_letivo': {
                    'data_inicio': turma_disc.data_inicio,
                    'data_fim': turma_disc.data_fim
                },
                'notas': {
                    'avaliacoes': notas_list,
                    'total_avaliacoes': len(notas_list),
                    'total_notas_lancadas': total_notas_lancadas,
                    'media': round(media, 2)
                },
                'frequencia': {
                    'total_aulas': total_aulas,
                    'presencas': presencas,
                    'ausencias': ausencias,
                    'justificadas': justificadas,
                    'percentual_presenca': round(percentual_presenca, 2)
                }
            }
            
            boletim_data['disciplinas'].append(disciplina_data)
        
        return Response({
            'success': True,
            'data': boletim_data,
            'message': 'Boletim gerado com sucesso'
        })
