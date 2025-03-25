from django.urls import path
from . import views

urlpatterns = [
    path('', views.saved, name='saved_recipes'),
]
