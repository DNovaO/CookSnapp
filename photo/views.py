"""
version 1.0 - 22/11/2024 - Aguilar Velázquez Marco Antonio:
    Inicia un método de vista que permite a los usuarios iniciar su cámara en la aplicación.
    Direccioa al apartado de la cámara para que el usuario pueda capturar diferente información.
"""
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
