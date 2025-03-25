from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from django.shortcuts import render, redirect
from django.contrib import messages

@login_required
def change_passwd(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Mantiene la sesión del usuario
            messages.success(request, 'Your password has been changed successfully.')
            return redirect('password_change_done')  
    else:
        form = PasswordChangeForm(request.user)
    
    return render(request, 'password_change_template/password_change.html', {'form': form})
