from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import requests
import random

def obtener_recetas_aleatorias(cantidad=6):
    recetas = []
    try:
        for _ in range(cantidad):
            response = requests.get("https://www.themealdb.com/api/json/v1/1/random.php")
            data = response.json()

            if data and data['meals']:
                meal = data['meals'][0]
                ingredientes = []
                for i in range(1, 21):
                    ingr = meal.get(f"strIngredient{i}")
                    medida = meal.get(f"strMeasure{i}")
                    if ingr and ingr.strip():
                        ingredientes.append(f"{medida} {ingr}".strip())

                recetas.append({
                    'titulo': meal['strMeal'],
                    'imagen': meal['strMealThumb'],
                    'categoria': meal.get('strCategory', ''),
                    'area': meal.get('strArea', ''),
                    'instrucciones': meal['strInstructions'].split('\n') if meal['strInstructions'] else [],
                    'ingredientes': ingredientes
                })
        return recetas
    except Exception as e:
        return []

def buscar_recetas_por_nombre(query):
    recetas = []
    try:
        url = f"https://www.themealdb.com/api/json/v1/1/search.php?s={query}"
        response = requests.get(url)
        data = response.json()

        if data and data['meals']:
            for m in data['meals'][:20]:  
                ingredientes = []
                for i in range(1, 21):
                    ingr = m.get(f"strIngredient{i}")
                    medida = m.get(f"strMeasure{i}")
                    if ingr and ingr.strip():
                        ingredientes.append(f"{medida} {ingr}".strip())

                recetas.append({
                    'titulo': m['strMeal'],
                    'imagen': m['strMealThumb'],
                    'categoria': m.get('strCategory', ''),
                    'area': m.get('strArea', ''),
                    'instrucciones': m['strInstructions'].split('\n') if m['strInstructions'] else [],
                    'ingredientes': ingredientes
                })

        return recetas
    except Exception as e:
        return []

@login_required
def explore(request):
    try:
        q = request.GET.get('q')
        if q:
            recetas_web = buscar_recetas_por_nombre(q)
        else:
            recetas_web = obtener_recetas_aleatorias(20)

        return render(request, 'explore_recipes_template/explore_recipes.html', {
            'recetas_web': recetas_web,
            'busqueda_actual': q or ''
        })
    except Exception as e:
        return render(request, 'explore_recipes_template/explore_recipes.html', {
            'recetas_web': [],
            'busqueda_actual': ''
        })
