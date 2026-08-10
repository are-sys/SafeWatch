<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class VitalSign extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'vital_signs';

    protected $fillable = [
        'user_id', 'heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic',
        'temperature', 'oxygen_saturation', 'steps', 'latitude', 'longitude', 'recorded_at',
        'ml_analysis',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'ml_analysis' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isHeartRateAbnormal(): bool
    {
        return $this->heart_rate && ($this->heart_rate < 50 || $this->heart_rate > 120);
    }

    public function isOxygenLow(): bool
    {
        return $this->oxygen_saturation && $this->oxygen_saturation < 90;
    }

    public function isTemperatureAbnormal(): bool
    {
        return $this->temperature && ($this->temperature < 35.0 || $this->temperature > 39.0);
    }

    public function isBloodPressureAbnormal(): bool
    {
        return ($this->blood_pressure_systolic && $this->blood_pressure_systolic > 140)
            || ($this->blood_pressure_diastolic && $this->blood_pressure_diastolic > 90);
    }
}
