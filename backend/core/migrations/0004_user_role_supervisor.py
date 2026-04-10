from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_user_role_aluno'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('admin', 'Administrador'),
                    ('supervisor', 'Supervisor'),
                    ('professor', 'Professor'),
                    ('aluno', 'Aluno'),
                ],
                default='professor',
                max_length=20,
                verbose_name='Função',
            ),
        ),
    ]
