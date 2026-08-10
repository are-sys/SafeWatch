<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_requires_verification_code()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Usuario Prueba',
            'email' => 'prueba@ejemplo.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'paciente',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'requires_2fa' => true,
                'email' => 'prueba@ejemplo.com',
            ]);
    }

    public function test_login_does_not_send_verification_code_for_registered_user()
    {
        $user = User::create([
            'name' => 'Usuario Registrado',
            'email' => 'registrado@ejemplo.com',
            'password' => Hash::make('Password123!'),
            'role' => 'paciente',
        ]);

        $user->medicalProfile()->create();

        $response = $this->postJson('/api/login', [
            'email' => 'registrado@ejemplo.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'requires_2fa' => false,
            ])
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email'],
            ]);
    }
}
