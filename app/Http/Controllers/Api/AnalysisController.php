<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VitalSign;
use App\Services\MachineLearningService;
use Illuminate\Http\Request;

class AnalysisController extends Controller
{
    /**
     * Get Data Analysis Model results for the authenticated user or patient.
     * Integrates:
     * 1. Análisis Descriptivo (promedios, máximos y mínimos).
     * 2. Análisis de Tendencias (evolución de mediciones).
     * 3. Detección de Anomalías (valores inusuales).
     * 4. Aprendizaje Supervisado (Árboles de Decisión).
     * 5. Aprendizaje No Supervisado (K-Means Clustering).
     * a apoyar la toma de decisiones.
     */
    public function mlAnalysis(Request $request)
    {
        $user = $request->user();
        $patientId = $request->query('patient_id');

        if ($patientId && ($user->isDoctor() || $user->isAdmin())) {
            $userVitalsQuery = VitalSign::where('user_id', (string) $patientId);
        } else {
            $userVitalsQuery = $user->vitalSigns();
        }

        $latestVital = (clone $userVitalsQuery)->latest('recorded_at')->first();

        if (!$latestVital) {
            return response()->json([
                'status' => 'no_data',
                'message' => 'No hay lecturas registradas para el análisis de datos.',
            ]);
        }

        // Fetch history for descriptive statistics and trend evolution
        $historyVitals = (clone $userVitalsQuery)->latest('recorded_at')->take(20)->get()->toArray();

        // Run fresh Data Analysis Model computation
        $currentAnalysis = MachineLearningService::analyze($latestVital, $historyVitals);

        $anomaliesCount = 0;
        $riskDistribution = ['normal' => 0, 'warning' => 0, 'critical' => 0];

        foreach ($historyVitals as $v) {
            $level = $v['ml_analysis']['supervised_learning']['risk_level'] ?? ($v['ml_analysis']['risk_level'] ?? 'normal');
            if (isset($riskDistribution[$level])) {
                $riskDistribution[$level]++;
            }
            if (!empty($v['ml_analysis']['anomaly_detection']['is_anomaly']) || !empty($v['ml_analysis']['is_anomaly'])) {
                $anomaliesCount++;
            }
        }

        return response()->json([
            'status' => 'success',
            'latest' => [
                'vital_id' => (string) $latestVital->_id,
                'recorded_at' => $latestVital->recorded_at,
                'vitals' => [
                    'heart_rate' => $latestVital->heart_rate,
                    'oxygen_saturation' => $latestVital->oxygen_saturation,
                    'temperature' => $latestVital->temperature,
                    'blood_pressure_systolic' => $latestVital->blood_pressure_systolic,
                    'blood_pressure_diastolic' => $latestVital->blood_pressure_diastolic,
                    'steps' => $latestVital->steps,
                ],
                'analysis' => $currentAnalysis,
            ],
            'history_summary' => [
                'total_analyzed' => count($historyVitals),
                'anomalies_detected' => $anomaliesCount,
                'risk_distribution' => $riskDistribution,
            ],
            'model_components' => [
                'descriptive' => 'Promedios, máximos y mínimos',
                'trends' => 'Evolución de las mediciones',
                'anomalies' => 'Detección de valores inusuales',
                'supervised' => 'Clasificación mediante Árboles de Decisión',
                'unsupervised' => 'Identificación de patrones mediante K-Means',
            ],
        ]);
    }
}
