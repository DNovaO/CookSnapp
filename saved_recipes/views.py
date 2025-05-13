from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import sqlite3
from django.conf import settings
from django.db import connection
from django.http import JsonResponse

@login_required
def saved_recipes_view(request):
    username = request.user.username

    conn = sqlite3.connect(settings.BASE_DIR / 'db.sqlite3')
    cursor = conn.cursor()

    cursor.execute("""
        SELECT recipe_id, title, s_date, steps, description
        FROM userSavedRecipes
        WHERE username = ?
    """, (username,))


    rows = cursor.fetchall()
    conn.close()

    saved_recipes = [
        {
            "id": row[0],
            "title": row[1],
            "date": row[2],
            "steps": row[3],
            "description": row[4] or "No description available."
        }
        for row in rows
    ]

    return render(request, "saved_recipes_template/saved_recipes.html", {
        "saved_recipes": saved_recipes
    })

def getSavedRecipes(request):
    if request.method == "GET":
        try:
            with connection.cursor() as cursor:
                query = """
                    SELECT recipe_id, title, s_date, steps, description
                    FROM userSavedRecipes
                    WHERE username = %s
                """
                
                cursor.execute(query, [request.user.username])
                rows = cursor.fetchall()
                
                # Crear un diccionario de recetas
                recipes = []
                for row in rows:
                    recipe = {
                        'title': row[1],
                        's_date': row[2],
                        'steps': row[3],
                        'description': row[4] if row[4] else "No description available."
                    }
                    recipes.append(recipe)

            # Devolver el contexto a la plantilla
            return JsonResponse({'recipes': recipes})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)