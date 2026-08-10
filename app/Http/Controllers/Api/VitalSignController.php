<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\VitalSign;
use App\Services\MachineLearningService;
use Illuminate\Http\Request;

class VitalSignController extends Controller
{
    public function index(Request $request)
    {
        $vitals = $request->user()->vitalSigns()
            ->latest('recorded_at')
            ->paginate(20);

        return response()->json($vitals);
    }

    public function store(Request $request)
    {
        $fields = ['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic',
                    'temperature', 'oxygen_saturation', 'steps', 'latitude', 'longitude'];

        $data = [];
        foreach ($fields as $f) {
            $val = $request->input($f);
            if ($val !== null && $val !== '') {
                $data[$f] = is_numeric($val) ? $val + 0 : null;
            }
        }

        $data['user_id'] = (string) $request->user()->_id;
        $data['recorded_at'] = now();

        $vital = VitalSign::create($data);

        // Run ML Supervised (Softmax/Random Forest) & Unsupervised (Isolation Forest) models
        $mlAnalysis = MachineLearningService::analyze($vital);
        $vital->ml_analysis = $mlAnalysis;
        $vital->save();

        $this->checkForAlerts($vital);

        return response()->json(['status' => 'ok', 'vital' => $vital], 201);
    }

    private function checkForAlerts(VitalSign $vital): void
    {
        if ($vital->isHeartRateAbnormal()) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'heart_rate',
                'severity' => $vital->heart_rate > 150 || $vital->heart_rate < 40 ? 'critical' : 'high',
                'message' => "Ritmo cardíaco anormal: {$vital->heart_rate} BPM",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }

        if ($vital->isOxygenLow()) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'oxygen',
                'severity' => $vital->oxygen_saturation < 85 ? 'critical' : 'high',
                'message' => "Oxígeno bajo: {$vital->oxygen_saturation}%",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }

        if ($vital->isTemperatureAbnormal()) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'temperature',
                'severity' => $vital->temperature > 40 || $vital->temperature < 34 ? 'critical' : 'high',
                'message' => "Temperatura anormal: {$vital->temperature}°C",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }

        if ($vital->isBloodPressureAbnormal()) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'blood_pressure',
                'severity' => $vital->blood_pressure_systolic > 180 ? 'critical' : 'high',
                'message' => "Presión arterial alta: {$vital->blood_pressure_systolic}/{$vital->blood_pressure_diastolic}",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }

        // Anomaly Detection
        if (!empty($vital->ml_analysis['is_anomaly'])) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'anomaly',
                'severity' => 'critical',
                'message' => "Anomalía fisiológica detectada en constantes vitales (Nivel: {$vital->ml_analysis['anomaly_score']})",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }
    }
}
