#!/usr/bin/env python
"""
Testa a API de turmas diretamente
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

def test_turmas_api():
    """Testa o endpoint de listagem de turmas"""
    print("\n=== TESTE DA API DE TURMAS ===\n")
    
    # Criar client autenticado
    client = APIClient()
    
    # Buscar usuário
    user = User.objects.first()
    if not user:
        print("❌ Nenhum usuário encontrado")
        return
    
    print(f"✓ Usuário encontrado: {user.email}")
    
    # Autenticar
    client.force_authenticate(user=user)
    
    # Fazer requisição
    print("\n📡 Fazendo requisição para /api/turmas/")
    response = client.get('/api/turmas/')
    
    print(f"\n📥 Status Code: {response.status_code}")
    print(f"\n📦 Resposta:")
    data = response.json() if hasattr(response, 'json') else response.data
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    # Análise
    print(f"\n🔍 ANÁLISE:")
    print(f"  - Tipo de data: {type(data)}")
    
    if isinstance(data, dict):
        print(f"  - Chaves: {list(data.keys())}")
        if 'data' in data:
            print(f"  - Tipo de data['data']: {type(data['data'])}")
            if isinstance(data['data'], list):
                print(f"  - Quantidade de itens: {len(data['data'])}")
                if len(data['data']) > 0:
                    print(f"  - Primeiro item: {data['data'][0]}")
            elif isinstance(data['data'], dict):
                print(f"  - data['data'] é um DICIONÁRIO (problema!)")
                print(f"  - Chaves do dicionário: {list(data['data'].keys())}")
        
        if 'total' in data:
            print(f"  - Total: {data['total']}")

if __name__ == '__main__':
    test_turmas_api()
