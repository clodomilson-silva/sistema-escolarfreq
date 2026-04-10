from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserCreateSerializer,
    LoginSerializer,
    RegisterSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with JWT tokens"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login endpoint
    POST /api/auth/login
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    senha = serializer.validated_data['senha']
    
    try:
        user = User.objects.get(email=email, is_active=True)
        
        if not user.check_password(senha):
            return Response({
                'success': False,
                'error': 'Credenciais inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        from django.utils import timezone
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return Response({
            'success': True,
            'data': {
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            },
            'message': 'Login realizado com sucesso'
        })
    
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Credenciais inválidas'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_view(request):
    """
    Register new professor/supervisor
    POST /api/auth/register
    Requires: Admin role
    """
    # Check if user is admin
    if not request.user.is_admin and not request.user.is_superuser:
        return Response({
            'success': False,
            'error': 'Apenas administradores podem criar novos usuários'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # Segurança: criação de administradores do sistema global apenas via banco de dados ou Django Admin.
    if request.data.get('role') == 'admin':
        return Response({
            'success': False,
            'error': 'Criacao de administrador permitida apenas via banco de dados ou painel Django Admin'
        }, status=status.HTTP_403_FORBIDDEN)
    
    role = serializer.validated_data.get('role', 'professor')

    # Check if email already exists
    if User.objects.filter(email=serializer.validated_data['email']).exists():
        return Response({
            'success': False,
            'error': 'Email já está em uso'
        }, status=status.HTTP_400_BAD_REQUEST)

    matricula = serializer.validated_data.get('matricula')
    if matricula and User.objects.filter(matricula=matricula).exists():
        return Response({
            'success': False,
            'error': 'Matricula ja esta em uso'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create user
    user = User.objects.create_user(
        email=serializer.validated_data['email'],
        nome=serializer.validated_data['nome'],
        matricula=serializer.validated_data.get('matricula') or None,
        telefone=serializer.validated_data.get('telefone') or None,
        data_nascimento=serializer.validated_data.get('data_nascimento'),
        endereco=serializer.validated_data.get('endereco') or None,
        password=serializer.validated_data['senha'],
        role=role,
        disciplinas=serializer.validated_data.get('disciplinas', [])
    )
    
    return Response({
        'success': True,
        'data': UserSerializer(user).data,
        'message': 'Usuario criado com sucesso'
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Get current user info
    GET /api/auth/me
    """
    return Response({
        'success': True,
        'data': UserSerializer(request.user).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token_view(request):
    """
    Verify if token is valid
    GET /api/auth/verify
    """
    return Response({
        'success': True,
        'data': {
            'user': UserSerializer(request.user).data
        },
        'message': 'Token válido'
    })


class UserListView(generics.ListAPIView):
    """
    List all users
    GET /api/auth/users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only admins can list all users
        if self.request.user.is_admin or self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def manage_professor_view(request, user_id):
    """
    Manage professor/supervisor profile/status
    PATCH /api/auth/users/{id}/
    Requires: Admin role
    """
    if not request.user.is_admin and not request.user.is_superuser:
        return Response({
            'success': False,
            'error': 'Apenas gestores podem gerenciar usuarios do painel'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id, role__in=['professor', 'supervisor'])
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Usuario não encontrado'
        }, status=status.HTTP_404_NOT_FOUND)

    dados = request.data

    if 'role' in dados:
        role_novo = dados.get('role')
        if role_novo not in ['professor', 'supervisor']:
            return Response({
                'success': False,
                'error': 'Perfil invalido. Use professor ou supervisor'
            }, status=status.HTTP_400_BAD_REQUEST)
        user.role = role_novo

    if 'email' in dados:
        email_novo = (dados.get('email') or '').strip().lower()
        if not email_novo:
            return Response({
                'success': False,
                'error': 'Email é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email_novo).exclude(id=user.id).exists():
            return Response({
                'success': False,
                'error': 'Email já está em uso'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.email = email_novo

    if 'matricula' in dados:
        matricula_nova = (dados.get('matricula') or '').strip()
        if not matricula_nova:
            return Response({
                'success': False,
                'error': 'Matricula é obrigatória para professor'
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(matricula=matricula_nova).exclude(id=user.id).exists():
            return Response({
                'success': False,
                'error': 'Matricula já está em uso'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.matricula = matricula_nova

    campos_editaveis = ['nome', 'telefone', 'data_nascimento', 'endereco', 'disciplinas', 'is_active']
    for campo in campos_editaveis:
        if campo in dados:
            setattr(user, campo, dados.get(campo))

    if 'senha' in dados and dados.get('senha'):
        senha = str(dados.get('senha'))
        if len(senha) < 6:
            return Response({
                'success': False,
                'error': 'Senha deve ter no minimo 6 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(senha)

    try:
        user.save()
    except Exception as exc:
        return Response({
            'success': False,
            'error': f'Erro ao atualizar professor: {str(exc)}'
        }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'success': True,
        'data': UserSerializer(user).data,
        'message': 'Usuario atualizado com sucesso'
    })
