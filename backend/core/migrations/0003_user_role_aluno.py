from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_user_professor_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('admin', 'Administrador'), ('professor', 'Professor'), ('aluno', 'Aluno')],
                default='professor',
                max_length=20,
                verbose_name='Função',
            ),
        ),
    ]
