# views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def main_view(request):
    if request.method == 'POST':
        # Aquí podrías guardar las preferencias si deseas
        return render(request, 'mainTemplate/mainTemplate.html')

    allergies = [
        "Peanuts", "Almonds", "Eggs", "Milk", "Shellfish", 
        "Soy", "Wheat", "Tree Nuts", "Fish", "Sesame",
        "Gluten", "Mustard"
    ]
    return render(request, 'user_pref_template/user_pref_template.html', {'allergies': allergies})
