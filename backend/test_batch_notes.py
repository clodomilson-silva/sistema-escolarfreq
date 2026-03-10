#!/usr/bin/env python
"""
Teste manual do endpoint batch_create de notas
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, force_authenticate
from turmas.models import Turma, Avaliacao
from alunos.models import Aluno

User = get_user_model()

def test_batch_create_notas():
    """Testa o endpoint batch_create de notas"""
    print("\n=== TESTE DO ENDPOINT BATCH_CREATE ===\n")
    
    # Criar client autenticado
    client = APIClient()
    
    # Buscar ou criar usuário admin
    user, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'nome': 'Admin Test',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        user.set_password('admin123')
        user.save()
        print(f"✓ Usuário admin criado")
    else:
        print(f"✓ Usuário admin encontrado")
    
    # Autenticar
    client.force_authenticate(user=user)
    
    # Buscar uma avaliação existente
    avaliacao = Avaliacao.objects.first()
    if not avaliacao:
        print("❌ Nenhuma avaliação encontrada. Crie uma avaliação primeiro.")
        return
    
    print(f"✓ Avaliação encontrada: {avaliacao.descricao}")
    print(f"  Turma: {avaliacao.turma.nome}")
    print(f"  Data: {avaliacao.data}")
    
    # Buscar alunos da turma
    alunos = avaliacao.turma.alunos.all()
    if not alunos.exists():
        print("❌ Nenhum aluno matriculado na turma da avaliação.")
        return
    
    print(f"✓ {alunos.count()} aluno(s) encontrado(s) na turma:")
    for aluno in alunos:
        print(f"  - {aluno.nome} (ID: {aluno.id})")
    
    # Preparar payload
    payload = {
        'avaliacao': avaliacao.id,
        'notas': [
            {
                'aluno_id': str(aluno.id),
                'valor': '8.5',
                'observacoes': 'Teste de persistência'
            }
            for aluno in alunos
        ]
    }
    
    print(f"\n📤 Enviando payload:")
    print(json.dumps(payload, indent=2))
    
    # Fazer requisição
    url = '/api/turmas/notas/batch_create/'
    print(f"\n🔗 URL: {url}")
    
    response = client.post(url, data=payload, format='json')
    
    print(f"\n📥 Resposta:")
    print(f"  Status: {response.status_code}")
    print(f"  Data: {json.dumps(response.data, indent=2)}")
    
    if response.status_code == 201:
        print("\n✅ Notas criadas com sucesso!")
        
        # Verificar no banco
        from turmas.models import Nota
        notas_salvas = Nota.objects.filter(avaliacao=avaliacao)
        print(f"\n✓ Total de notas no banco para esta avaliação: {notas_salvas.count()}")
        
        for nota in notas_salvas:
            print(f"  - {nota.aluno.nome}: {nota.valor}")
    else:
        print(f"\n❌ Erro ao criar notas!")
        if response.status_code == 404:
            print("  → Endpoint não encontrado (404)")
            print("  → Verifique se a URL está correta")
        elif response.status_code == 405:
            print("  → Método não permitido (405)")
            print("  → Verifique se o método POST está permitido")
        elif response.status_code == 400:
            print("  → Bad Request (400)")
            print("  → Verifique o payload")

if __name__ == '__main__':
    test_batch_create_notas()
