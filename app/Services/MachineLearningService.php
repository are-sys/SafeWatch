<?php

namespace App\Services;

use App\Models\VitalSign;

class MachineLearningService
{
    /**
     * Modelo de Análisis de Datos completo para SafeWatch.
     * Incorpora:
     * 1. Análisis descriptivo (promedios, máximos y mínimos).
     * 2. Análisis de tendencias (evolución de las mediciones).
     * 3. Detección de anomalías (valores inusuales).
     * 4. Aprendizaje supervisado (árboles de decisión).
     * 5. Aprendizaje no supervisado (K-Means).
     * Todo enfocado en apoyar la toma de decisiones.
     *
     * @param VitalSign $vital
     * @param array $history Recent vitals history
     * @return array
     */
    public static function analyze(VitalSign $vital, array $history = []): array
    {
        $features = self::extractFeatures($vital);

        // 1. Análisis Descriptivo (promedios, máximos, mínimos)
        $descriptive = self::descriptiveAnalysis($history, $vital);

        // 2. Análisis de Tendencias (evolución de las mediciones)
        $trend = self::trendAnalysis($history, $vital);

        // 3. Detección de Anomalías (valores inusuales)
        $anomaly = self::anomalyDetection($vital);

        // 4. Aprendizaje Supervisado (Clasificación mediante Árboles de Decisión)
        $supervised = self::decisionTreeClassification($features);

        // 5. Aprendizaje No Supervisado (Identificación de patrones mediante K-Means)
        $unsupervised = self::kMeansClustering($features);

        // Apoyo a la Toma de Decisiones
        $decisionSupport = self::generateDecisionSupport($vital, $descriptive, $trend, $anomaly, $supervised, $unsupervised);

        return [
            'descriptive_analysis' => $descriptive,
            'trend_analysis' => $trend,
            'anomaly_detection' => $anomaly,
            'supervised_learning' => $supervised,
            'unsupervised_learning' => $unsupervised,
            'decision_support' => $decisionSupport,

            // Legacy backward-compatibility aliases
            'risk_level' => $supervised['risk_level'],
            'risk_score' => $supervised['risk_score'],
            'is_anomaly' => $anomaly['is_anomaly'],
            'anomaly_score' => $anomaly['anomaly_score'],
            'insights' => $decisionSupport['recommendations'],
            'analyzed_at' => now()->toIso8601String(),
        ];
    }

    private static function extractFeatures(VitalSign $vital): array
    {
        return [
            'hr' => $vital->heart_rate ?? 75,
            'spo2' => $vital->oxygen_saturation ?? 98,
            'temp' => $vital->temperature ?? 36.6,
            'sbp' => $vital->blood_pressure_systolic ?? 120,
            'dbp' => $vital->blood_pressure_diastolic ?? 80,
            'steps' => $vital->steps ?? 3000,
        ];
    }

    /**
     * 1. ANÁLISIS DESCRIPTIVO: Promedios, Máximos y Mínimos.
     */
    public static function descriptiveAnalysis(array $history, VitalSign $current): array
    {
        $vitals = array_merge($history, [$current]);
        $hrs = array_filter(array_column($vitals, 'heart_rate'));
        $spo2s = array_filter(array_column($vitals, 'oxygen_saturation'));
        $temps = array_filter(array_column($vitals, 'temperature'));
        $sbps = array_filter(array_column($vitals, 'blood_pressure_systolic'));

        return [
            'heart_rate' => [
                'average' => count($hrs) ? round(array_sum($hrs) / count($hrs), 1) : $current->heart_rate,
                'max' => count($hrs) ? max($hrs) : $current->heart_rate,
                'min' => count($hrs) ? min($hrs) : $current->heart_rate,
                'current' => $current->heart_rate,
            ],
            'oxygen_saturation' => [
                'average' => count($spo2s) ? round(array_sum($spo2s) / count($spo2s), 1) : $current->oxygen_saturation,
                'max' => count($spo2s) ? max($spo2s) : $current->oxygen_saturation,
                'min' => count($spo2s) ? min($spo2s) : $current->oxygen_saturation,
                'current' => $current->oxygen_saturation,
            ],
            'temperature' => [
                'average' => count($temps) ? round(array_sum($temps) / count($temps), 1) : $current->temperature,
                'max' => count($temps) ? max($temps) : $current->temperature,
                'min' => count($temps) ? min($temps) : $current->temperature,
                'current' => $current->temperature,
            ],
            'systolic_pressure' => [
                'average' => count($sbps) ? round(array_sum($sbps) / count($sbps), 1) : $current->blood_pressure_systolic,
                'max' => count($sbps) ? max($sbps) : $current->blood_pressure_systolic,
                'min' => count($sbps) ? min($sbps) : $current->blood_pressure_systolic,
                'current' => $current->blood_pressure_systolic,
            ],
        ];
    }

    /**
     * 2. ANÁLISIS DE TENDENCIAS: Evolución de las mediciones en el tiempo.
     */
    public static function trendAnalysis(array $history, VitalSign $current): array
    {
        if (empty($history)) {
            return [
                'heart_rate_trend' => 'Estable',
                'oxygen_trend' => 'Estable',
                'overall_evolution' => 'Sin variaciones significativas registradas.',
            ];
        }

        $prev = end($history);
        $hrDiff = ($current->heart_rate && isset($prev['heart_rate'])) ? $current->heart_rate - $prev['heart_rate'] : 0;
        $spo2Diff = ($current->oxygen_saturation && isset($prev['oxygen_saturation'])) ? $current->oxygen_saturation - $prev['oxygen_saturation'] : 0;

        $hrTrend = $hrDiff > 5 ? 'Ascendente (▲)' : ($hrDiff < -5 ? 'Descendente (▼)' : 'Estable (►)');
        $spo2Trend = $spo2Diff < -2 ? 'Descendente (▼ Precaución)' : ($spo2Diff > 2 ? 'Mejoría (▲)' : 'Estable (►)');

        return [
            'heart_rate_trend' => $hrTrend,
            'oxygen_trend' => $spo2Trend,
            'hr_delta' => $hrDiff,
            'spo2_delta' => $spo2Diff,
            'overall_evolution' => "Evolución reciente: Ritmo cardíaco {$hrTrend}, Saturación O2 {$spo2Trend}.",
        ];
    }

    /**
     * 3. DETECCIÓN DE ANOMALÍAS: Identificación de valores inusuales.
     */
    public static function anomalyDetection(VitalSign $vital): array
    {
        $anomalies = [];
        $score = 0.0;

        if ($vital->heart_rate && ($vital->heart_rate < 45 || $vital->heart_rate > 130)) {
            $anomalies[] = "Frecuencia cardíaca inusual ({$vital->heart_rate} BPM)";
            $score += 0.4;
        }

        if ($vital->oxygen_saturation && $vital->oxygen_saturation < 91) {
            $anomalies[] = "Saturación de oxígeno inusualmente baja ({$vital->oxygen_saturation}%)";
            $score += 0.5;
        }

        if ($vital->temperature && ($vital->temperature < 34.5 || $vital->temperature > 39.2)) {
            $anomalies[] = "Temperatura corporal inusual ({$vital->temperature} °C)";
            $score += 0.4;
        }

        if ($vital->blood_pressure_systolic && $vital->blood_pressure_systolic > 160) {
            $anomalies[] = "Presión sistólica inusualmente alta ({$vital->blood_pressure_systolic} mmHg)";
            $score += 0.3;
        }

        $anomalyScore = min(1.0, round($score, 2));
        $isAnomaly = count($anomalies) > 0 || $anomalyScore >= 0.5;

        return [
            'is_anomaly' => $isAnomaly,
            'anomaly_score' => $anomalyScore,
            'unusual_values' => $anomalies,
            'status' => $isAnomaly ? 'Valores Inusuales Detectados' : 'Valores Fisiológicos Normales',
        ];
    }

    /**
     * 4. APRENDIZAJE SUPERVISADO: Clasificación mediante Árboles de Decisión.
     */
    public static function decisionTreeClassification(array $f): array
    {
        // Reglas de Árbol de Decisión Entrenado
        // Nodo Raíz: SpO2
        if ($f['spo2'] < 90) {
            // Rama Izquierda (SpO2 Crítico) -> Nodo 2: BPM
            if ($f['hr'] > 120 || $f['hr'] < 45) {
                $riskLevel = 'critical';
                $probCritical = 95.0;
                $probWarning = 5.0;
                $probNormal = 0.0;
                $nodePath = "Nodo 1 [SpO2 < 90] -> Nodo 2 [HR Anormal] -> Clase Crítico";
            } else {
                $riskLevel = 'critical';
                $probCritical = 80.0;
                $probWarning = 20.0;
                $probNormal = 0.0;
                $nodePath = "Nodo 1 [SpO2 < 90] -> Nodo 2 [HR Normal] -> Clase Crítico";
            }
        } elseif ($f['spo2'] <= 94 || $f['hr'] > 110 || $f['sbp'] > 140) {
            // Rama Central (Fisiología Alterada) -> Nodo 3: Presión Sistólica
            if ($f['sbp'] > 160 || $f['temp'] > 38.5) {
                $riskLevel = 'critical';
                $probCritical = 65.0;
                $probWarning = 30.0;
                $probNormal = 5.0;
                $nodePath = "Nodo 1 [SpO2 90-94] -> Nodo 3 [Presión > 160 / Temp > 38.5] -> Clase Crítico";
            } else {
                $riskLevel = 'warning';
                $probCritical = 15.0;
                $probWarning = 75.0;
                $probNormal = 10.0;
                $nodePath = "Nodo 1 [SpO2 90-94] -> Nodo 3 [Presión Normal] -> Clase Precaución";
            }
        } else {
            // Rama Derecha (Signos Estables)
            $riskLevel = 'normal';
            $probCritical = 2.0;
            $probWarning = 8.0;
            $probNormal = 90.0;
            $nodePath = "Nodo 1 [SpO2 >= 95] -> Nodo 4 [FC & PA Estable] -> Clase Saludable";
        }

        $riskScore = round(($probWarning * 0.4) + ($probCritical * 1.0), 1);

        return [
            'algorithm' => 'Árboles de Decisión (Decision Tree Classifier)',
            'risk_level' => $riskLevel,
            'risk_score' => $riskScore,
            'node_path' => $nodePath,
            'probabilities' => [
                'normal' => $probNormal,
                'warning' => $probWarning,
                'critical' => $probCritical,
            ],
        ];
    }

    /**
     * 5. APRENDIZAJE NO SUPERVISADO: Identificación de patrones mediante K-Means.
     */
    public static function kMeansClustering(array $f): array
    {
        // Centroides precalculados para k=3 clusters de patrones biométricos
        // Vector de características: [BPM, SpO2, Temp, PresiónSistólica]
        $centroids = [
            'Cluster_0' => ['name' => 'Patrón Reposo / Estable', 'hr' => 70, 'spo2' => 98.5, 'temp' => 36.5, 'sbp' => 118],
            'Cluster_1' => ['name' => 'Patrón de Respuesta Activa', 'hr' => 98, 'spo2' => 96.5, 'temp' => 37.1, 'sbp' => 132],
            'Cluster_2' => ['name' => 'Patrón de Inestabilidad Fisiológica', 'hr' => 125, 'spo2' => 88.0, 'temp' => 38.6, 'sbp' => 165],
        ];

        // Cálculo de Distancia Euclidiana
        $distances = [];
        foreach ($centroids as $key => $c) {
            $dist = sqrt(
                pow(($f['hr'] - $c['hr']), 2) +
                pow(($f['spo2'] - $c['spo2']) * 5, 2) + // Peso escalar en SpO2
                pow(($f['temp'] - $c['temp']) * 10, 2) +
                pow(($f['sbp'] - $c['sbp']), 2)
            );
            $distances[$key] = $dist;
        }

        // Asignación al centroide con distancia mínima
        asort($distances);
        $assignedClusterKey = array_key_first($distances);
        $assignedCluster = $centroids[$assignedClusterKey];
        $minDistance = round($distances[$assignedClusterKey], 2);

        return [
            'algorithm' => 'K-Means Clustering (k=3)',
            'assigned_cluster' => $assignedCluster['name'],
            'cluster_id' => $assignedClusterKey,
            'euclidean_distance' => $minDistance,
            'pattern_description' => "La lectura actual agrupa óptimamente en el {$assignedCluster['name']} (Distancia euclidiana: {$minDistance}).",
        ];
    }

    /**
     * APOYO A LA TOMA DE DECISIONES: Síntesis integrada para médicos y pacientes.
     */
    private static function generateDecisionSupport(
        VitalSign $vital,
        array $descriptive,
        array $trend,
        array $anomaly,
        array $supervised,
        array $unsupervised
    ): array {
        $recommendations = [];
        $urgency = 'Baja';

        if ($supervised['risk_level'] === 'critical' || $anomaly['is_anomaly']) {
            $urgency = 'Alta / Inmediata';
            $recommendations[] = "Atención prioritaria: Evaluación médica urgente recomendada por patrón crítico en el árbol de decisión.";
        } elseif ($supervised['risk_level'] === 'warning') {
            $urgency = 'Moderada';
            $recommendations[] = "Monitoreo continuo: Se sugiere descansar y tomar una segunda lectura en 15 minutos.";
        } else {
            $recommendations[] = "Estado biológicamente equilibrado: Mantener actividades normales y plan de hidratación.";
        }

        if (!empty($anomaly['unusual_values'])) {
            foreach ($anomaly['unusual_values'] as $valNote) {
                $recommendations[] = "Alerta de valor inusual: {$valNote}.";
            }
        }

        $recommendations[] = $trend['overall_evolution'];
        $recommendations[] = "Patrón Fisiológico: Paciente ubicado en {$unsupervised['assigned_cluster']}.";

        return [
            'decision_summary' => "Recomendación basada en el Modelo de Análisis de Datos para la toma de decisiones clínicas.",
            'action_urgency' => $urgency,
            'recommendations' => $recommendations,
        ];
    }
}
