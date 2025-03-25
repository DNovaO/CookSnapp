from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.db import connection  # Para ejecutar consultas SQL directamente

User = get_user_model()  # Obtiene el modelo de usuario correcto

# Función para agregar la columna si no existe
def add_new_user_column():
    with connection.cursor() as cursor:
        # Verificar si la columna ya existe
        cursor.execute("PRAGMA table_info(auth_user);")  # Para SQLite
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'new_user' not in columns:
            cursor.execute("ALTER TABLE auth_user ADD COLUMN new_user BOOLEAN DEFAULT 1;")

# Ejecutar la función al iniciar
add_new_user_column()

def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password_confirmation = request.POST['password_confirmation']

        if password != password_confirmation:
            messages.error(request, "Passwords do not match.")
            return redirect('register')

        if User.objects.filter(username=username).exists():
            messages.error(request, "The username is already taken.")
            return redirect('register')

        if User.objects.filter(email=email).exists():
            messages.error(request, "An account with this email already exists.")
            return redirect('register')

        try:
            user = User.objects.create_user(username=username, email=email, password=password)

            # Verifica si `new_user` existe antes de asignarlo
            if hasattr(user, 'new_user'):
                user.new_user = True
                user.save()
            
            messages.success(request, "Account created successfully.")
            return redirect('login')
        except Exception as e:
            messages.error(request, f"Error: {str(e)}")
            return redirect('register')

    return render(request, 'register_template/register.html')
