from django.shortcuts import render

# Create your views here.
def saved(request):
    return render(request, 'saved_recipes_template/saved_recipes.html')