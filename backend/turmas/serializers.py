from rest_framework import serializers
from .models import Turma, Autorizacao, Avaliacao, Nota
from alunos.serializers import AlunoSerializer


class TurmaSerializer(serializers.ModelSerializer):
    """Serializer for Turma model"""
    total_alunos = serializers.ReadOnlyField()
    alunos = AlunoSerializer(many=True, read_only=True)
    turma_base_id = serializers.IntegerField(source='turma_base.id', read_only=True, allow_null=True)
    
    class Meta:
        model = Turma
        fields = [
            'id', 'nome', 'ano', 'turno', 'disciplina', 'professor', 'sala',
            'tipo', 'turma_base_id', 'alunos', 'total_alunos', 'horarios', 
            'dias_letivos', 'data_inicio', 'data_fim', 'status', 'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']


class TurmaListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing turmas"""
    total_alunos = serializers.ReadOnlyField()
    turma_base_id = serializers.IntegerField(source='turma_base.id', read_only=True, allow_null=True)
    
    class Meta:
        model = Turma
        fields = [
            'id', 'nome', 'ano', 'turno', 'disciplina', 'professor', 'sala',
            'tipo', 'turma_base_id', 'total_alunos', 'status', 'criado_em'
        ]


class TurmaCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Turma"""
    alunos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=__import__('alunos.models', fromlist=['Aluno']).Aluno.objects.all(),
        required=False
    )
    turma_base_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Turma
        fields = [
            'nome', 'ano', 'turno', 'disciplina', 'professor', 'sala',
            'tipo', 'turma_base_id', 'alunos', 'horarios', 'dias_letivos', 
            'data_inicio', 'data_fim', 'status'
        ]
    
    def validate_nome(self, value):
        """Check if turma name already exists"""
        if Turma.objects.filter(nome=value).exists():
            raise serializers.ValidationError("Já existe uma turma com este nome")
        return value
    
    def create(self, validated_data):
        """Create turma with turma_base relationship"""
        turma_base_id = validated_data.pop('turma_base_id', None)
        alunos = validated_data.pop('alunos', [])
        
        # Se tem turma_base_id, buscar e associar
        if turma_base_id:
            try:
                turma_base = Turma.objects.get(id=turma_base_id)
                validated_data['turma_base'] = turma_base
                # Se for turma-disciplina, copiar alunos da turma base
                if not alunos and validated_data.get('tipo') == 'disciplina':
                    alunos = list(turma_base.alunos.all())
            except Turma.DoesNotExist:
                raise serializers.ValidationError({"turma_base_id": "Turma base não encontrada"})
        
        turma = Turma.objects.create(**validated_data)
        
        # Adicionar alunos
        if alunos:
            turma.alunos.set(alunos)
        
        return turma


class TurmaUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Turma"""
    alunos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=__import__('alunos.models', fromlist=['Aluno']).Aluno.objects.all(),
        required=False
    )
    
    class Meta:
        model = Turma
        fields = [
            'nome', 'ano', 'turno', 'disciplina', 'professor', 'sala',
            'tipo', 'alunos', 'horarios', 'dias_letivos', 
            'data_inicio', 'data_fim', 'status'
        ]
    
    def validate_nome(self, value):
        """Check if turma name already exists (excluding current instance)"""
        instance = self.instance
        if Turma.objects.filter(nome=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError("Já existe uma turma com este nome")
        return value


class AutorizacaoSerializer(serializers.ModelSerializer):
    """Serializer for Autorizacao model"""
    aluno_nome = serializers.CharField(source='aluno.nome', read_only=True)
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    
    class Meta:
        model = Autorizacao
        fields = [
            'id', 'turma', 'turma_nome', 'aluno', 'aluno_nome',
            'tipo', 'data', 'motivo', 'observacoes', 'status',
            'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']


class AutorizacaoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Autorizacao"""
    
    class Meta:
        model = Autorizacao
        fields = ['turma', 'aluno', 'tipo', 'data', 'motivo', 'observacoes', 'status']
    
    def validate(self, data):
        """Validate that aluno belongs to turma"""
        turma = data.get('turma')
        aluno = data.get('aluno')
        
        if not turma.alunos.filter(id=aluno.id).exists():
            raise serializers.ValidationError("O aluno não pertence a esta turma")
        
        return data


class AvaliacaoSerializer(serializers.ModelSerializer):
    """Serializer for Avaliacao model"""
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    total_notas = serializers.SerializerMethodField()
    
    class Meta:
        model = Avaliacao
        fields = [
            'id', 'turma', 'turma_nome', 'descricao', 'tipo', 'data', 
            'peso', 'nota_maxima', 'observacoes', 'total_notas',
            'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']
    
    def get_total_notas(self, obj):
        """Get total number of grades registered"""
        return obj.notas.count()


class AvaliacaoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Avaliacao"""
    
    class Meta:
        model = Avaliacao
        fields = ['turma', 'descricao', 'tipo', 'data', 'peso', 'nota_maxima', 'observacoes']


class NotaSerializer(serializers.ModelSerializer):
    """Serializer for Nota model"""
    aluno_nome = serializers.CharField(source='aluno.nome', read_only=True)
    avaliacao_descricao = serializers.CharField(source='avaliacao.descricao', read_only=True)
    avaliacao_data = serializers.DateField(source='avaliacao.data', read_only=True)
    avaliacao_tipo = serializers.CharField(source='avaliacao.tipo', read_only=True)
    nota_maxima = serializers.DecimalField(source='avaliacao.nota_maxima', read_only=True, max_digits=5, decimal_places=2)
    
    class Meta:
        model = Nota
        fields = [
            'id', 'avaliacao', 'avaliacao_descricao', 'avaliacao_data', 'avaliacao_tipo',
            'aluno', 'aluno_nome', 'valor', 'nota_maxima', 'observacoes',
            'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']


class NotaCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Nota"""
    
    class Meta:
        model = Nota
        fields = ['avaliacao', 'aluno', 'valor', 'observacoes']
    
    def validate(self, data):
        """Validate grade value and student enrollment"""
        avaliacao = data.get('avaliacao')
        aluno = data.get('aluno')
        valor = data.get('valor')
        
        # Check if student belongs to the turma
        if not avaliacao.turma.alunos.filter(id=aluno.id).exists():
            raise serializers.ValidationError("O aluno não pertence a esta turma")
        
        # Check if grade is within valid range
        if valor < 0 or valor > avaliacao.nota_maxima:
            raise serializers.ValidationError(f"A nota deve estar entre 0 e {avaliacao.nota_maxima}")
        
        return data


class NotaBatchSerializer(serializers.Serializer):
    """Serializer for batch creating/updating grades"""
    avaliacao = serializers.PrimaryKeyRelatedField(queryset=Avaliacao.objects.all())
    notas = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    
    def validate_notas(self, value):
        """Validate grades list"""
        if not value:
            raise serializers.ValidationError("A lista de notas não pode estar vazia")
        
        required_fields = ['aluno_id', 'valor']
        for nota in value:
            for field in required_fields:
                if field not in nota:
                    raise serializers.ValidationError(f"Campo obrigatório ausente: {field}")
        
        return value
    
    def create(self, validated_data):
        """Create or update multiple grades at once"""
        from alunos.models import Aluno
        from decimal import Decimal
        
        avaliacao = validated_data['avaliacao']
        notas_data = validated_data['notas']
        
        notas_created = []
        errors = []
        
        for nota_data in notas_data:
            try:
                aluno = Aluno.objects.get(id=nota_data['aluno_id'])
                
                # Check if student belongs to turma
                if not avaliacao.turma.alunos.filter(id=aluno.id).exists():
                    errors.append(f"Aluno {aluno.nome} não pertence à turma")
                    continue
                
                valor = Decimal(str(nota_data['valor']))
                
                # Check if grade is within valid range
                if valor < 0 or valor > avaliacao.nota_maxima:
                    errors.append(f"Nota inválida para {aluno.nome}: deve estar entre 0 e {avaliacao.nota_maxima}")
                    continue
                
                # Create or update grade
                nota, created = Nota.objects.update_or_create(
                    avaliacao=avaliacao,
                    aluno=aluno,
                    defaults={
                        'valor': valor,
                        'observacoes': nota_data.get('observacoes', '')
                    }
                )
                notas_created.append(nota)
                
            except Aluno.DoesNotExist:
                errors.append(f"Aluno com ID {nota_data['aluno_id']} não encontrado")
            except Exception as e:
                errors.append(f"Erro ao processar nota: {str(e)}")
        
        return {
            'notas': notas_created,
            'errors': errors,
            'total_processadas': len(notas_created),
            'total_erros': len(errors)
        }
