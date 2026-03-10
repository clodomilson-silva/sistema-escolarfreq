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
    Register new admin/professor
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
    
    # Check if email already exists
    if User.objects.filter(email=serializer.validated_data['email']).exists():
        return Response({
            'success': False,
            'error': 'Email já está em uso'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create user
    user = User.objects.create_user(
        email=serializer.validated_data['email'],
        nome=serializer.validated_data['nome'],
        password=serializer.validated_data['senha'],
        role=serializer.validated_data.get('role', 'professor'),
        disciplinas=serializer.validated_data.get('disciplinas', [])
    )
    
    return Response({
        'success': True,
        'data': UserSerializer(user).data,
        'message': 'Administrador criado com sucesso'
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
