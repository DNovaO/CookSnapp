from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import sqlite3
from django.conf import settings

@login_required
def saved_recipes_view(request):
    username = request.user.username

    conn = sqlite3.connect(settings.BASE_DIR / 'db.sqlite3')
    cursor = conn.cursor()

    cursor.execute("""
        SELECT recipe_id, title, s_date, steps
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
            "steps": row[3]
        }
        for row in rows
    ]

    return render(request, "saved_recipes_template/saved_recipes.html", {
        "saved_recipes": saved_recipes
    })