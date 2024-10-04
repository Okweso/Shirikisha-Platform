# Generated by Django 5.1.1 on 2024-10-02 08:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bill_participation', '0003_bill_category'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='opinion',
            name='weather_agree',
        ),
        migrations.AddField(
            model_name='opinion',
            name='weather_support',
            field=models.CharField(blank=True, choices=[('Support', 'Support'), ('Not support', 'Not support')], max_length=255, null=True),
        ),
    ]
