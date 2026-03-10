#!/usr/bin/env python
"""
Script para criar o primeiro administrador do sistema
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()


def criar_admin():
    """Criar primeiro administrador"""
    email = input('Email do administrador: ')
    nome = input('Nome do administrador: ')
    senha = input('Senha: ')
    
    if User.objects.filter(email=email).exists():
        print(f'❌ Já existe um usuário com o email {email}')
        return
    
    user = User.objects.create_superuser(
        email=email,
        nome=nome,
        password=senha,
        role='admin'
    )
    
    print(f'✅ Administrador {nome} criado com sucesso!')
    print(f'   Email: {email}')
    print(f'   Role: {user.role}')


if __name__ == '__main__':
    criar_admin()
