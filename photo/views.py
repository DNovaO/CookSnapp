"""
version 1.1 - 08/05/2025 - Diego Nova Olguin:
    Se generan 3 recetas en formato JSON usando los ingredientes recibidos.
    Es el core de la aplicación.
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.conf import settings
import sqlite3
from django.db import connection
from textwrap import dedent
from django.utils.timezone import now
import google.generativeai as genai

@csrf_exempt
def photo(request):
    return render(request, 'photoTemplate/photoTemplate.html')


import json
import google.generativeai as genai
from django.conf import settings

def generate_recipe(ingredients, nivel='intermediate', nutricion='yes', alergias='none', idioma='english'):
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel(model_name="gemini-2.5-flash-preview-05-20")

    prompt = f"""
    Eres un generador de recetas culinarias experto. Siempre debes generar 3 recetas diferentes en base a los siguientes criterios personalizados:

    Ingredientes disponibles: {ingredients}
    Nivel de cocina del usuario: {nivel} 
    Requerimientos nutricionales: {nutricion}
    Alergias o ingredientes a evitar: {alergias}
    Idioma: {idioma}

    Responde únicamente en formato JSON, siguiendo exactamente esta estructura para cada receta:

    [
    {{
        "titulo": "Nombre de la receta",
        "descripcion": "Breve descripción de la receta",
        "pasos": ["Instrucciones paso por paso hasta que sean todas las instrucciones"]
    }},
    ...
    ]

    No incluyas ninguna explicación fuera del JSON. Asegúrate de que los ingredientes dados se utilicen y se respeten las alergias y preferencias nutricionales.
    """

    try:
        response = model.generate_content(prompt, generation_config={"temperature": 0.8})
        content = response.text.strip()

        # Eliminar posibles backticks y lenguaje del bloque (como ```json)
        if content.startswith("```"):
            content = content.strip("`")  # elimina los backticks
            lines = content.splitlines()
            if lines and lines[0].strip().lower() == "json":
                lines = lines[1:]  # elimina "json"
            content = "\n".join(lines)

        recipe_json = json.loads(content)
        if not isinstance(recipe_json, list) or len(recipe_json) != 3:
            raise ValueError("La respuesta no contiene exactamente 3 recetas")

        return recipe_json

    except json.JSONDecodeError as e:
        print("Contenido recibido:\n", content)
        raise ValueError("La respuesta del modelo no es un JSON válido") from e

    except Exception as e:
        raise RuntimeError("Error generando recetas con Gemini") from e

@csrf_exempt
def process_ingredients(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ingredients = [item['food'] for item in data.get('ingredients', [])]
            username = data.get('username', request.user.username)

            print("Los ingredientes son: ", ingredients)
            print("El nombre de usuario es: ", username)

            if not ingredients:
                return JsonResponse({'error': 'No se recibieron ingredientes'}, status=400)

            # Obtener user_id
            with connection.cursor() as cursor:
                cursor.execute("SELECT id FROM auth_user WHERE username = %s", [username])
                user_row = cursor.fetchone()
                if not user_row:
                    return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
                user_id = user_row[0]

            print("El id de usuario es: ", user_id)

            # Obtener preferencias del usuario
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT allergies, nutrition, cooking_level, language 
                    FROM userPreferences 
                    WHERE user_id = %s
                """, [user_id])
                preferences = cursor.fetchone()

            if not preferences:
                preferences = ('none', 'yes', 'intermediate', 'english')

            allergies, nutrition, cooking_level, language = preferences
            
            print("Las preferencias son: ", preferences)

            recipe = generate_recipe(ingredients, cooking_level, nutrition, allergies, language)

            return JsonResponse({'recipes': recipe})
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def save_recipe(request):
    try:
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Usuario no autenticado"}, status=403)

        data = json.loads(request.body)

        print('La data es:', data)

        titulo = data.get("titulo", "Untitled Recipe")
        descripcion = data.get("descripcion", "")
        pasos = data.get("pasos", [])

        if not isinstance(pasos, list):
            return JsonResponse({"error": "Formato de pasos inválido"}, status=400)

        pasos_texto = "\n".join(pasos)
        username = request.user.username
        fecha_guardado = now().strftime("%Y-%m-%d %H:%M:%S")

        conn = sqlite3.connect(settings.BASE_DIR / 'db.sqlite3')
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO userSavedRecipes (title, description, steps, s_date, username)
            VALUES (?, ?, ?, ?, ?)
        """, (titulo, descripcion, pasos_texto, fecha_guardado, username))
        conn.commit()
        conn.close()

        return JsonResponse({"message": "Receta guardada con éxito"})
    except Exception as e:
        return JsonResponse({"error": f"Error interno: {str(e)}"}, status=500)


    # content = dedent("""
    # [
    #     {
    #         "titulo": "Apple Cinnamon Muffins (Dairy-Free)",
    #         "descripcion": "Delicious and moist muffins made with fresh apples, perfect for breakfast or a snack.",
    #         "pasos": [
    #             "Preheat the oven to 180°C (350°F) and line a muffin tray with paper liners.",
    #             "In a bowl, mix 1 cup flour, 1/2 cup sugar, 1 tsp baking powder, and 1/2 tsp cinnamon.",
    #             "In another bowl, whisk 1 egg and 1/4 cup melted dairy-free butter (e.g., plant-based spread).",
    #             "Peel and finely dice 1 apple, then fold it into the wet mixture.",
    #             "Combine wet and dry ingredients until just mixed; do not overmix.",
    #             "Spoon the batter into muffin cups, filling each about 2/3 full.",
    #             "Bake for 20–25 minutes or until a toothpick comes out clean.",
    #             "Let cool before serving."
    #         ]
    #     },
    #     {
    #         "titulo": "Dairy-Free Apple Pancakes",
    #         "descripcion": "Fluffy pancakes with grated apple and a touch of cinnamon, ideal for a comforting dairy-free breakfast.",
    #         "pasos": [
    #             "In a large bowl, combine 1 cup flour, 2 tbsp sugar, 1 tsp baking powder, and 1/2 tsp cinnamon.",
    #             "In another bowl, whisk 1 egg with 3/4 cup water and 2 tbsp melted dairy-free butter.",
    #             "Grate 1 apple and mix it into the wet ingredients.",
    #             "Pour the wet mixture into the dry ingredients and stir gently until combined.",
    #             "Heat a non-stick pan over medium heat and lightly grease it with dairy-free butter.",
    #             "Pour 1/4 cup batter per pancake and cook until bubbles form on the surface.",
    #             "Flip and cook for another 2–3 minutes until golden.",
    #             "Serve warm with a sprinkle of sugar or maple syrup."
    #         ]
    #     },
    #     {
    #         "titulo": "Baked Apple Fritters (Dairy-Free)",
    #         "descripcion": "Oven-baked apple fritters made without dairy, a healthier twist on a classic treat.",
    #         "pasos": [
    #             "Preheat oven to 200°C (400°F) and line a baking tray with parchment paper.",
    #             "In a bowl, mix 1 cup flour, 1/4 cup sugar, 1 tsp baking powder, and a pinch of salt.",
    #             "Whisk 1 egg with 1/3 cup water and 2 tbsp melted dairy-free butter.",
    #             "Peel and dice 1 apple, then fold it into the batter.",
    #             "Drop spoonfuls of the batter onto the baking tray, spacing them out evenly.",
    #             "Bake for 15–18 minutes until golden brown.",
    #             "Let cool slightly and optionally dust with powdered sugar."
    #         ]
    #     }
    # ]
    # """)

    # print("La respuesta del modelo es: ", content)