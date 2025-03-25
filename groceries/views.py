from django.shortcuts import render

# Create your views here.
def groceries(request):
    return render(request, 'groceries_template/groceries.html')
