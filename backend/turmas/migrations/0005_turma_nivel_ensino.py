from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('turmas', '0004_turma_data_fim_turma_data_inicio_avaliacao_nota'),
    ]

    operations = [
        migrations.AddField(
            model_name='turma',
            name='nivel_ensino',
            field=models.CharField(
                choices=[
                    ('fundamental', 'Ensino Fundamental'),
                    ('medio', 'Ensino Medio'),
                    ('tecnico', 'Curso Tecnico'),
                    ('profissionalizante', 'Curso Profissionalizante'),
                ],
                default='fundamental',
                max_length=20,
                verbose_name='Nivel de Ensino',
            ),
        ),
    ]
