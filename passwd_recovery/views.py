from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.shortcuts import render
from django.contrib import messages
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.urls import reverse
from django.conf import settings

def passwd_recovery(request):
    if request.method == 'POST':
        email = request.POST['email']
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # Envía el correo con el link de recuperación
            reset_link = request.build_absolute_uri(
                reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})
            )
            subject = 'Recuperación de contraseña'
            message = render_to_string('password_recovery_template/password_reset_email.html', {
                'user': user,
                'reset_link': reset_link,
            })
            send_mail(
                subject,
                message,  # Ahora usamos el mensaje renderizado desde el template
                'leo_mata7791@outlook.com',  # Remitente
                [email],  # Destinatario
                fail_silently=False,
                html_message=message
            )
            messages.success(request, 'A recovery email has been sent.')
        except User.DoesNotExist:
            messages.error(request, 'This email direction doesn\'t appear to be registered.')
    return render(request, 'password_recovery_template/password_recovery.html')
