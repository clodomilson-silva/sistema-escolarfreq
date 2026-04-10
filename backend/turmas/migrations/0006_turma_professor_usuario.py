from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def vincular_professor_por_nome(apps, schema_editor):
    Turma = apps.get_model('turmas', 'Turma')
    User = apps.get_model('core', 'User')

    for turma in Turma.objects.exclude(professor__isnull=True).exclude(professor=''):
        professores = User.objects.filter(role='professor', nome=turma.professor)
        if professores.count() == 1:
            turma.professor_usuario = professores.first()
            turma.save(update_fields=['professor_usuario'])


class Migration(migrations.Migration):

    dependencies = [
        ('turmas', '0005_turma_nivel_ensino'),
        ('core', '0002_user_professor_fields'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='turma',
            name='professor_usuario',
            field=models.ForeignKey(
                blank=True,
                limit_choices_to={'role': 'professor'},
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='turmas_alocadas',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Professor (Cadastro)',
            ),
        ),
        migrations.RunPython(vincular_professor_por_nome, migrations.RunPython.noop),
    ]
