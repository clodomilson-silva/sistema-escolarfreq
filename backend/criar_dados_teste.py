#!/usr/bin/env python
"""
Script para criar dados de teste no sistema
"""
import os
import sys
import django
from datetime import date, timedelta
from random import choice, randint

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from alunos.models import Aluno
from turmas.models import Turma, Autorizacao
from frequencia.models import Frequencia

User = get_user_model()


def criar_usuarios():
    """Criar usuários de teste"""
    print("\n📋 Criando usuários...")
    
    # Admin
    if not User.objects.filter(email='admin@escola.com').exists():
        User.objects.create_superuser(
            email='admin@escola.com',
            nome='Administrador',
            password='admin123',
            role='admin'
        )
        print("✅ Admin criado: admin@escola.com / admin123")
    
    # Professores
    professores = [
        ('prof.matematica@escola.com', 'Prof. João Silva', ['Matemática']),
        ('prof.portugues@escola.com', 'Profa. Maria Santos', ['Português', 'Literatura']),
        ('prof.ciencias@escola.com', 'Prof. Carlos Oliveira', ['Ciências', 'Biologia']),
    ]
    
    for email, nome, disciplinas in professores:
        if not User.objects.filter(email=email).exists():
            User.objects.create_user(
                email=email,
                nome=nome,
                password='prof123',
                role='professor',
                disciplinas=disciplinas
            )
            print(f"✅ Professor criado: {email} / prof123")


def criar_alunos():
    """Criar alunos de teste"""
    print("\n📋 Criando alunos...")
    
    nomes = [
        "Ana Silva", "Bruno Costa", "Carlos Eduardo", "Daniela Lima",
        "Eduardo Santos", "Fernanda Oliveira", "Gabriel Souza", "Helena Martins",
        "Igor Alves", "Juliana Pereira", "Lucas Rodrigues", "Mariana Ferreira",
        "Nicolas Gomes", "Olivia Ribeiro", "Pedro Henrique", "Rafaela Carvalho",
        "Samuel Araújo", "Tatiana Dias", "Vitor Hugo", "Yasmin Barbosa"
    ]
    
    alunos_criados = []
    
    for i, nome in enumerate(nomes, start=1):
        matricula = f"2024{i:03d}"
        email_base = nome.lower().replace(" ", ".").replace("ã", "a").replace("í", "i")
        email = f"{email_base}@aluno.com"
        
        if not Aluno.objects.filter(matricula=matricula).exists():
            data_nascimento = date(2010 + randint(0, 3), randint(1, 12), randint(1, 28))
            
            aluno = Aluno.objects.create(
                nome=nome,
                matricula=matricula,
                email=email,
                data_nascimento=data_nascimento,
                telefone=f"(11) 9{randint(1000, 9999)}-{randint(1000, 9999)}",
                responsavel=f"Responsável de {nome.split()[0]}",
                telefone_responsavel=f"(11) 9{randint(1000, 9999)}-{randint(1000, 9999)}"
            )
            alunos_criados.append(aluno)
            print(f"✅ Aluno criado: {nome} ({matricula})")
    
    return alunos_criados or list(Aluno.objects.all())


def criar_turmas(alunos):
    """Criar turmas de teste"""
    print("\n📋 Criando turmas...")
    
    turmas_data = [
        ("6º Ano A", 2024, "matutino", "Matemática", "Prof. João Silva"),
        ("6º Ano B", 2024, "vespertino", "Português", "Profa. Maria Santos"),
        ("7º Ano A", 2024, "matutino", "Ciências", "Prof. Carlos Oliveira"),
        ("7º Ano B", 2024, "vespertino", "Matemática", "Prof. João Silva"),
        ("8º Ano A", 2024, "matutino", "Português", "Profa. Maria Santos"),
    ]
    
    turmas_criadas = []
    
    for nome, ano, turno, disciplina, professor in turmas_data:
        if not Turma.objects.filter(nome=nome).exists():
            turma = Turma.objects.create(
                nome=nome,
                ano=ano,
                turno=turno,
                disciplina=disciplina,
                professor=professor,
                sala=f"Sala {randint(101, 210)}",
                horarios={
                    "segunda": "08:00-12:00",
                    "terca": "08:00-12:00",
                    "quarta": "08:00-12:00",
                    "quinta": "08:00-12:00",
                    "sexta": "08:00-12:00",
                },
                status='ativa'
            )
            
            # Adicionar alunos aleatórios
            alunos_turma = alunos[:randint(4, 8)]
            turma.alunos.set(alunos_turma)
            alunos = alunos[len(alunos_turma):]  # Remover alunos já adicionados
            
            turmas_criadas.append(turma)
            print(f"✅ Turma criada: {nome} com {turma.total_alunos} alunos")
    
    return turmas_criadas or list(Turma.objects.all())


def criar_frequencias(turmas):
    """Criar frequências de teste"""
    print("\n📋 Criando frequências...")
    
    count = 0
    hoje = date.today()
    
    for turma in turmas:
        # Criar frequências dos últimos 30 dias
        for dias_atras in range(30):
            data_freq = hoje - timedelta(days=dias_atras)
            
            # Pular fins de semana
            if data_freq.weekday() >= 5:
                continue
            
            for aluno in turma.alunos.all():
                status = choice(['presente', 'presente', 'presente', 'ausente', 'justificado'])
                
                Frequencia.objects.get_or_create(
                    turma=turma,
                    aluno=aluno,
                    data=data_freq,
                    disciplina=turma.disciplina,
                    defaults={
                        'status': status,
                        'observacoes': 'Atestado médico' if status == 'justificado' else ''
                    }
                )
                count += 1
    
    print(f"✅ {count} registros de frequência criados")


def criar_autorizacoes(turmas):
    """Criar autorizações de teste"""
    print("\n📋 Criando autorizações...")
    
    count = 0
    hoje = date.today()
    
    for turma in turmas[:3]:  # Apenas 3 primeiras turmas
        alunos_turma = list(turma.alunos.all())
        
        for _ in range(randint(2, 5)):
            aluno = choice(alunos_turma)
            tipo = choice(['saida_antecipada', 'ausencia', 'atividade_externa'])
            data_aut = hoje + timedelta(days=randint(1, 15))
            status_aut = choice(['pendente', 'aprovada', 'rejeitada'])
            
            Autorizacao.objects.create(
                turma=turma,
                aluno=aluno,
                tipo=tipo,
                data=data_aut,
                motivo=f"Motivo de {tipo.replace('_', ' ')}",
                status=status_aut,
                observacoes=f"Observação para {aluno.nome}"
            )
            count += 1
    
    print(f"✅ {count} autorizações criadas")


def main():
    """Executar criação de dados de teste"""
    print("=" * 60)
    print("🚀 CRIANDO DADOS DE TESTE PARA O SISTEMA ESCOLAR")
    print("=" * 60)
    
    try:
        criar_usuarios()
        alunos = criar_alunos()
        turmas = criar_turmas(alunos)
        criar_frequencias(turmas)
        criar_autorizacoes(turmas)
        
        print("\n" + "=" * 60)
        print("✅ DADOS DE TESTE CRIADOS COM SUCESSO!")
        print("=" * 60)
        print("\n📊 Resumo:")
        print(f"   - Usuários: {User.objects.count()}")
        print(f"   - Alunos: {Aluno.objects.count()}")
        print(f"   - Turmas: {Turma.objects.count()}")
        print(f"   - Frequências: {Frequencia.objects.count()}")
        print(f"   - Autorizações: {Autorizacao.objects.count()}")
        print("\n🔐 Credenciais de acesso:")
        print("   Admin: admin@escola.com / admin123")
        print("   Professor: prof.matematica@escola.com / prof123")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Erro ao criar dados: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
