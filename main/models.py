# models.py
from django.db import models
from django.contrib.auth.models import User

class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    allergies = models.TextField(blank=True)
    nutrition = models.TextField(blank=True)
    cooking_level = models.TextField(blank=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"

    class Meta:
        db_table = 'userPreferences'  # <--- Aquí defines el nombre personalizado
