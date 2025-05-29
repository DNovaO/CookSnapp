"""
version 1.1 - 08/05/2025 - Diego Nova Olguin:
    Se generan 3 recetas en formato JSON usando los ingredientes recibidos.
    Es el core de la aplicación.
"""
import json
import base64
import cv2
import numpy as np
import os
import sqlite3
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.conf import settings
from django.db import connection
from django.utils.timezone import now
import google.generativeai as genai
from ultralytics import YOLO

# Cargar modelo YOLO una vez
MODEL_PATH = os.path.join(settings.BASE_DIR,  "yolo_models", "optimized.pt") 
yolo_model = YOLO(MODEL_PATH)

@csrf_exempt
def photo(request):
    return render(request, 'photoTemplate/photoTemplate.html')

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

        if content.startswith("```"):
            content = content.strip("`")
            lines = content.splitlines()
            if lines and lines[0].strip().lower() == "json":
                lines = lines[1:]
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

            with connection.cursor() as cursor:
                cursor.execute("SELECT id FROM auth_user WHERE username = %s", [username])
                user_row = cursor.fetchone()
                if not user_row:
                    return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
                user_id = user_row[0]

            print("El id de usuario es: ", user_id)

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

@csrf_exempt
def detect_ingredients(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image_data = data.get('image', '')

            if not image_data:
                return JsonResponse({'error': 'No se proporcionó imagen'}, status=400)

            header, encoded = image_data.split(",", 1)
            img_bytes = base64.b64decode(encoded)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            results = yolo_model.predict(source=img_np, conf=0.4, imgsz=640)

            ingredients = set()
            for r in results:
                if hasattr(r, 'names') and hasattr(r, 'boxes'):
                    for box in r.boxes:
                        class_id = int(box.cls[0])
                        class_name = r.names[class_id]
                        ingredients.add(class_name)

            return JsonResponse({'ingredients': list(ingredients)})

        except Exception as e:
            print("Error:", e)
            return JsonResponse({'error': f"Detection failed: {str(e)}"}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=400)
