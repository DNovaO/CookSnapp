from django.urls import path
from .views import saved_recipes_view, getSavedRecipes

urlpatterns = [
    path("", saved_recipes_view, name="saved_recipes"),
    path("getSavedRecipes/", getSavedRecipes, name="getSavedRecipes"),  # Agregamos la nueva ruta para getSavedRecipes
]
