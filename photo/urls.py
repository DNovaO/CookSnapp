from django.urls import path
from .import views
from .views import photo, process_ingredients


urlpatterns = [
    path('', photo, name='photo'),
    path('process-ingredients/', process_ingredients, name='process_ingredients'),
    path('detect_objects/', views.detect_objects, name='detect_objects'),
]
