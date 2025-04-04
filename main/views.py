from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db import connection
import json

@login_required
def main_view(request):
    if request.method == 'POST':
        # Actualiza el campo new_user a 0
        with connection.cursor() as cursor:
            query = """
                UPDATE auth_user SET new_user = 0 WHERE username = %s
            """

            cursor.execute(
                query,
                [request.user.username]
            )

        # Si el frontend usa fetch con JSON
        data = json.loads(request.body)

        insertPreferences(data, request.user.id)
        return redirect('main')

    # Verifica si el usuario ya configuró preferencias
    with connection.cursor() as cursor:
        query = """
            SELECT new_user FROM auth_user WHERE username = %s
        """

        cursor.execute(
            query,
            [request.user.username]
        )
        row = cursor.fetchone()
        new_user_value = row[0] if row else 1

    if new_user_value == 0:
        return render(request, 'mainTemplate/mainTemplate.html')

    allergies = [
        "Peanuts", "Almonds", "Eggs", "Milk", "Shellfish", 
        "Soy", "Wheat", "Tree Nuts", "Fish", "Sesame",
        "Gluten", "Mustard"
    ]
    return render(request, 'user_pref_template/user_pref_template.html', {'allergies': allergies})

def insertPreferences(data, user_id):
    """
    Insertar las preferencias del usuario en la tabla userPreferences.
    """
    allergies = data.get('allergies', [])
    nutrition = data.get('nutrition', [])
    cooking_level = data.get('cookingLevel', '')  # Cambié a '' en vez de []

    if isinstance(allergies, list):
        allergies = ','.join(allergies)
    if isinstance(nutrition, list):
        nutrition = ','.join(nutrition)

    # Aquí no es necesario hacer el join si `cooking_level` ya es una cadena
    if not cooking_level:  # Si el cooking_level está vacío, asigna un valor predeterminado
        cooking_level = 'Beginner'  # O el valor que consideres apropiado

    print(f"Allergies: {allergies}")
    print(f"Nutrition: {nutrition}")
    print(f"Cooking Level: {cooking_level}")

    with connection.cursor() as cursor:
        query = """     
            INSERT INTO userPreferences (user_id, allergies, nutrition, cooking_level)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                allergies = EXCLUDED.allergies,
                nutrition = EXCLUDED.nutrition,
                cooking_level = EXCLUDED.cooking_level
        """    
        
        cursor.execute(
            query,
            [user_id, allergies, nutrition, cooking_level]
        )
