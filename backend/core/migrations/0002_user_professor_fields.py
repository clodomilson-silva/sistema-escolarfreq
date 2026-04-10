from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='matricula',
            field=models.CharField(blank=True, max_length=50, null=True, unique=True, verbose_name='Matricula'),
        ),
        migrations.AddField(
            model_name='user',
            name='telefone',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='Telefone'),
        ),
        migrations.AddField(
            model_name='user',
            name='data_nascimento',
            field=models.DateField(blank=True, null=True, verbose_name='Data de Nascimento'),
        ),
        migrations.AddField(
            model_name='user',
            name='endereco',
            field=models.TextField(blank=True, null=True, verbose_name='Endereco'),
        ),
    ]
