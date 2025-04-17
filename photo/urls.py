from django.urls import path
from .views import photo, process_ingredients
from .views import save_recipe 

urlpatterns = [
    path('', photo, name='photo'),
    path('process-ingredients/', process_ingredients, name='process_ingredients'),
    path("save_recipe/", save_recipe, name="save_recipe"),
]
