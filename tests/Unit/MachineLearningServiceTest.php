<?php

namespace Tests\Unit;

use App\Models\VitalSign;
use App\Services\MachineLearningService;
use PHPUnit\Framework\TestCase;

class MachineLearningServiceTest extends TestCase
{
    /**
     * Test data analysis model with normal vital signs.
     */
    public function test_normal_vitals_analysis()
    {
        $vital = new VitalSign([
            'heart_rate' => 72,
            'oxygen_saturation' => 99,
            'temperature' => 36.6,
            'blood_pressure_systolic' => 120,
            'blood_pressure_diastolic' => 80,
            'steps' => 4500,
        ]);

        $result = MachineLearningService::analyze($vital);

        $this->assertArrayHasKey('descriptive_analysis', $result);
        $this->assertArrayHasKey('trend_analysis', $result);
        $this->assertArrayHasKey('anomaly_detection', $result);
        $this->assertArrayHasKey('supervised_learning', $result);
        $this->assertArrayHasKey('unsupervised_learning', $result);
        $this->assertArrayHasKey('decision_support', $result);

        $this->assertEquals('normal', $result['supervised_learning']['risk_level']);
        $this->assertFalse($result['anomaly_detection']['is_anomaly']);
        $this->assertStringContainsString('K-Means', $result['unsupervised_learning']['algorithm']);
        $this->assertStringContainsString('Árboles de Decisión', $result['supervised_learning']['algorithm']);
    }

    /**
     * Test data analysis model with critical anomalous vital signs.
     */
    public function test_critical_anomaly_vitals_analysis()
    {
        $vital = new VitalSign([
            'heart_rate' => 165,
            'oxygen_saturation' => 82,
            'temperature' => 39.8,
            'blood_pressure_systolic' => 185,
            'blood_pressure_diastolic' => 115,
            'steps' => 100,
        ]);

        $result = MachineLearningService::analyze($vital);

        $this->assertEquals('critical', $result['supervised_learning']['risk_level']);
        $this->assertTrue($result['anomaly_detection']['is_anomaly']);
        $this->assertGreaterThan(0.4, $result['anomaly_detection']['anomaly_score']);
        $this->assertEquals('Alta / Inmediata', $result['decision_support']['action_urgency']);
    }
}
