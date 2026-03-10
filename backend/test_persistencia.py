#!/usr/bin/env python
"""
Script de teste para verificar persistência de dados no banco
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from turmas.models import Turma, Avaliacao, Nota
from alunos.models import Aluno
from frequencia.models import Frequencia
from datetime import date, datetime
from decimal import Decimal

def testar_notas():
    """Testa se as notas estão sendo salvas"""
    print("\n=== TESTANDO NOTAS ===")
    
    # Buscar todas as notas
    notas = Nota.objects.all()
    print(f"Total de notas no banco: {notas.count()}")
    
    if notas.exists():
        print("\nÚltimas 5 notas:")
        for nota in notas[:5]:
            print(f"  - Aluno: {nota.aluno.nome}, Avaliação: {nota.avaliacao.descricao}, Nota: {nota.valor}")
    
    return notas.count()

def testar_avaliacoes():
    """Testa se as avaliações estão sendo salvas"""
    print("\n=== TESTANDO AVALIAÇÕES ===")
 
    avaliacoes = Avaliacao.objects.all()
    print(f"Total de avaliações no banco: {avaliacoes.count()}")
    
    if avaliacoes.exists():
        print("\nÚltimas 5 avaliações:")
        for av in avaliacoes[:5]:
            print(f"  - {av.descricao} ({av.tipo}) - Turma: {av.turma.nome}, Data: {av.data}")
            # Contar notas dessa avaliação
            num_notas = av.notas.count()
            print(f"    → Notas lançadas: {num_notas}")
    
    return avaliacoes.count()

def testar_frequencias():
    """Testa se as frequências estão sendo salvas"""
    print("\n=== TESTANDO FREQUÊNCIAS ===")
    
    frequencias = Frequencia.objects.all()
    print(f"Total de frequências no banco: {frequencias.count()}")
    
    if frequencias.exists():
        print("\nÚltimas 5 frequências:")
        for freq in frequencias[:5]:
            print(f"  - Aluno: {freq.aluno.nome}, Turma: {freq.turma.nome}, Data: {freq.data}, Status: {freq.status}")
    
    return frequencias.count()

def testar_turmas_alunos():
    """Testa a relação muitos-para-muitos entre turmas e alunos"""
    print("\n=== TESTANDO TURMAS E ALUNOS ===")
    
    turmas = Turma.objects.all()
    print(f"Total de turmas no banco: {turmas.count()}")
    
    if turmas.exists():
        print("\nAlunos por turma:")
        for turma in turmas:
            num_alunos = turma.alunos.count()
            print(f"  - {turma.nome}: {num_alunos} aluno(s)")
            if num_alunos > 0:
                print(f"    Alunos: {', '.join([a.nome for a in turma.alunos.all()[:5]])}")
    
    alunos = Aluno.objects.all()
    print(f"\nTotal de alunos no banco: {alunos.count()}")
    
    return turmas.count(), alunos.count()

if __name__ == '__main__':
    print("=" * 60)
    print("TESTE DE PERSISTÊNCIA DE DADOS NO BANCO")
    print("=" * 60)
    
    try:
        turmas_count, alunos_count = testar_turmas_alunos()
        avaliacoes_count = testar_avaliacoes()
        notas_count = testar_notas()
        frequencias_count = testar_frequencias()
        
        print("\n" + "=" * 60)
        print("RESUMO:")
        print(f"  - Turmas: {turmas_count}")
        print(f"  - Alunos: {alunos_count}")
        print(f"  - Avaliações: {avaliacoes_count}")
        print(f"  - Notas: {notas_count}")
        print(f"  - Frequências: {frequencias_count}")
        print("=" * 60)
        
        if notas_count == 0:
            print("\n⚠️  ATENÇÃO: Nenhuma nota encontrada no banco!")
            print("   Isso pode indicar que as notas não estão sendo salvas.")
        
        if frequencias_count == 0:
            print("\n⚠️  ATENÇÃO: Nenhuma frequência encontrada no banco!")
            print("   Isso pode indicar que as frequências não estão sendo salvas.")
        
    except Exception as e:
        print(f"\n❌ ERRO ao testar: {e}")
        import traceback
        traceback.print_exc()
