from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db import connection
import json

@login_required
def main_view(request):
    if request.method == 'POST':
        # Maneja datos enviados como JSON o formulario
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST

        # Marca al usuario como no nuevo
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE auth_user SET new_user = 0 WHERE username = %s
            """, [request.user.username])

        # Inserta o actualiza preferencias
        insertPreferences(data, request.user.id)

        return redirect('main')

    # Consulta si el usuario es nuevo
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT new_user FROM auth_user WHERE username = %s
        """, [request.user.username])
        row = cursor.fetchone()
        new_user_value = row[0] if row else 1

    # Lista base de alergias
    allergies = [
        "Peanuts", "Almonds", "Eggs", "Milk", "Shellfish", 
        "Soy", "Wheat", "Tree Nuts", "Fish", "Sesame",
        "Gluten", "Mustard"
    ]

    if new_user_value == 0:
        preferences = getPreferences(request)
        return render(request, 'mainTemplate/mainTemplate.html', {
            'user_preferences': preferences,
            'allergies': allergies
        })

    return render(request, 'user_pref_template/user_pref_template.html', {'allergies': allergies})


def insertPreferences(data, user_id):
    """
    Insertar o actualizar las preferencias del usuario en la tabla userPreferences.
    """
    allergies = data.get('allergies', [])
    nutrition = data.get('nutrition', '')
    cooking_level = data.get('cooking_level', '')

    # Normaliza listas en string CSV
    if isinstance(allergies, list):
        allergies = ','.join(allergies)
    if isinstance(nutrition, list):
        nutrition = ','.join(nutrition)

    if not cooking_level:
        cooking_level = 'Beginner'

    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO userPreferences (user_id, allergies, nutrition, cooking_level)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                allergies = EXCLUDED.allergies,
                nutrition = EXCLUDED.nutrition,
                cooking_level = EXCLUDED.cooking_level
        """, [user_id, allergies, nutrition, cooking_level])

def getPreferences(request):
    """
    Obtener las preferencias del usuario desde la tabla userPreferences.
    """
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT allergies, nutrition, cooking_level
            FROM userPreferences
            WHERE user_id = %s
        """, [request.user.id])
        row = cursor.fetchone()

    if row:
        allergies, nutrition, cooking_level = row
        return {
            'allergies': [a.strip() for a in allergies.split(',')] if allergies else [],
            'nutrition': nutrition if nutrition else 'No',
            'cooking_level': cooking_level or 'Beginner'
        }

    return {
        'allergies': [],
        'nutrition': 'No',
        'cooking_level': 'Beginner'
    }
