import base64
from ultralytics import YOLO
from PIL import Image
import io
import numpy as np
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from django.shortcuts import render
from transformers import AutoTokenizer, AutoModelForCausalLM    # pip install transformers


def photo(request):
    return render(request, 'photoTemplate/photoTemplate.html')

# Cargar modelo GPT-2 y tokenizer
tokenizer = AutoTokenizer.from_pretrained("EleutherAI/gpt-neo-1.3B")
model = AutoModelForCausalLM.from_pretrained("EleutherAI/gpt-neo-1.3B")

def generate_recipe(ingredients):
    # Construir el prompt
    prompt = (
        f"You are a professional chef. Create a detailed, delicious, and unique recipe "
        f"using the following ingredients: {', '.join(ingredients)}. "
        f"Include a catchy recipe title, a brief description, a list of ingredients with quantities, "
        f"and step-by-step cooking instructions. "
        f"Make sure the recipe is coherent and practical for home cooking.\n\n"
        f"Recipe Title:"
    )
    
    # Codificar el prompt
    inputs = tokenizer.encode(prompt, return_tensors="pt")

    # Generar el texto
    output = model.generate(
        inputs,
        max_length=300,
        num_return_sequences=1,
        no_repeat_ngram_size=2,
        pad_token_id=tokenizer.eos_token_id,
    )

    # Decodificar el resultado generado
    generated_text = tokenizer.decode(output[0], skip_special_tokens=True)

    # Extraer la receta eliminando el prompt inicial
    recipe = generated_text[len(prompt):].strip()
    return recipe

def process_ingredients(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ingredients = [item['food'] for item in data.get('ingredients', [])]

            if not ingredients:
                return JsonResponse({'error': 'No ingredients provided'}, status=400)

            recipe = generate_recipe(ingredients)

            return JsonResponse({'recipe': recipe})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)


# Cargar modelo YOLOv8 
yolo_model = YOLO("yolov8n.pt") #dataset cocoa por el momento

@csrf_exempt
def detect_objects(request): # nueva vista para detectar objetos
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image_data = data.get('image')

            if not image_data:
                return JsonResponse({'error': 'No image data received'}, status=400)

            # Decodificar imagen 
            header, encoded = image_data.split(",", 1)
            img_bytes = base64.b64decode(encoded)
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            img_np = np.array(img)

            # Procesar con YOLOv8
            results = yolo_model(img_np)[0]
            detected = [yolo_model.names[int(cls)] for cls in results.boxes.cls]

            return JsonResponse({'ingredients': list(set(detected))})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=400)