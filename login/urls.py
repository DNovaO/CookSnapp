"""
version 1.0 - 18/10/2024 - Aguilar Velázquez Marco Antonio:
    Transmite la función login_view a la URL de la aplicación con nomre login.
"""
from django.urls import path
from .views import login_view

urlpatterns = [
    path('', login_view, name='login'),
]