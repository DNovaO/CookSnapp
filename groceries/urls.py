from django.urls import path
from . import views

urlpatterns = [
    path('', views.groceries, name='groceries'),
    # path('process-ingredients/', views.process_ingredients, name='process_ingredients'),

]
