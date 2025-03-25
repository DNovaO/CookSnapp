from django.urls import path
from .views import change_passwd

urlpatterns = [
    path('', change_passwd, name='change_passwd'),
]
