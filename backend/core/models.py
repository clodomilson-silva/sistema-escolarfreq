from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError('O email é obrigatório')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model"""
    
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('supervisor', 'Supervisor'),
        ('professor', 'Professor'),
        ('aluno', 'Aluno'),
    ]
    
    email = models.EmailField('Email', unique=True)
    nome = models.CharField('Nome', max_length=255)
    matricula = models.CharField('Matricula', max_length=50, unique=True, null=True, blank=True)
    telefone = models.CharField('Telefone', max_length=20, blank=True, null=True)
    data_nascimento = models.DateField('Data de Nascimento', blank=True, null=True)
    endereco = models.TextField('Endereco', blank=True, null=True)
    role = models.CharField('Função', max_length=20, choices=ROLE_CHOICES, default='professor')
    disciplinas = models.JSONField('Disciplinas', default=list, blank=True)
    
    is_active = models.BooleanField('Ativo', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    is_superuser = models.BooleanField('Superusuário', default=False)
    
    date_joined = models.DateTimeField('Data de cadastro', default=timezone.now)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    last_login = models.DateTimeField('Último login', null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.nome} ({self.email})"
    
    @property
    def is_admin(self):
        """Check if user is gestor/supervisor"""
        return self.role in ['admin', 'supervisor']

    @property
    def is_supervisor(self):
        """Check if user is supervisor"""
        return self.role == 'supervisor'
    
    @property
    def is_professor(self):
        """Check if user is professor"""
        return self.role == 'professor'

    @property
    def is_aluno(self):
        """Check if user is aluno"""
        return self.role == 'aluno'
