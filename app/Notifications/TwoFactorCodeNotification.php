<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TwoFactorCodeNotification extends Notification
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
            ->subject('📩 Tu Código de Confirmación de 6 Dígitos — SafeWatch Health')
            ->greeting('Hola, ' . $name)

            ->line('Tu código de confirmación de 6 dígitos para acceder a la plataforma de monitoreo biométrico SafeWatch es:')
            ->line('### 🔐 ' . $this->code)
            ->line('Este código de seguridad expira en 10 minutos.')
            ->line('Si no has solicitado este acceso, por favor ignora este mensaje o contacta al administrador de SafeWatch.');
    }
}
