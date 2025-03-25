"""
version 1.0 - 18/10/2024 - Aguilar Velázquez Marco Antonio:
    Inicia un método de vista que permite a los usuarios iniciar sesión en la aplicación.
    Direccioa a la página principal si el usuario inicia sesión correctamente.
"""
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data = request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('main')
    else:
        form = AuthenticationForm()        
    return render(request, 'loginTemplate/loginTemplate.html', {'form': form})
            