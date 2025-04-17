from django.urls import path
from .views import saved_recipes_view

urlpatterns = [
    path("", saved_recipes_view, name="saved_recipes"),
]
