from django.urls import path
from .views import photo, process_ingredients

urlpatterns = [
    path('', photo, name='photo'),
    path('process-ingredients/', process_ingredients, name='process_ingredients'),
]
