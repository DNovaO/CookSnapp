"""
URL configuration for CookSnap project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),  # Agregado para que {% url 'logout' %} funcione
    
    path('', include('login.urls')),
    path('login/', include('login.urls')),
    path('main/', include('main.urls')),
    path('explore_recipes/', include('explore_recipes.urls')),
    path('saved_recipes/', include('saved_recipes.urls')),
    path('groceries/', include('groceries.urls')),
    path('passwd_recovery/', include('passwd_recovery.urls')),
    path('register/', include('register.urls')),
    path('passwd_change/', include('passwd_change.urls')),
    path('photo/', include('photo.urls')),
]
