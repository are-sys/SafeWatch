<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordCodeNotification extends Notification
{
    use Queueable;

    public string $code;

    public function __construct(string $code)
    {
        $this->code = $code;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $name = is_object($notifiable) && isset($notifiable->name) ? $notifiable->name : 'Usuario';

        return (new MailMessage)
            ->subject('🔑 Restablecimiento de Contraseña — SafeWatch Health')
            ->greeting('Hola, ' . $name)
            ->line('Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en la plataforma SafeWatch.')
            ->line('Tu código de verificación de 6 dígitos es:')
            ->line('### 🔐 ' . $this->code)
            ->line('Este código es válido durante 15 minutos.')
            ->line('Si tú no solicitaste cambiar tu contraseña, por favor ignora este mensaje y tu contraseña continuará siendo la misma.');
    }
}
