import { PatientRecord } from '../types';

// Pseudo-random number generator with seed for reproducible cohort generation
function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateHistoricalCohort(size: number = 1200): PatientRecord[] {
  const rand = pseudoRandom(42);
  const records: PatientRecord[] = [];

  for (let i = 1; i <= size; i++) {
    const age = Math.round(22 + rand() * 58); // 22 to 80
    const sex: 'male' | 'female' = rand() > 0.52 ? 'female' : 'male';
    const familyHistory = rand() < (age > 45 ? 0.38 : 0.22);
    
    // Lifestyle markers
    const smokingRand = rand();
    const smokingStatus: 'never' | 'former' | 'current' = 
      smokingRand < 0.60 ? 'never' : smokingRand < 0.85 ? 'former' : 'current';
    
    const physicalActivityHours = parseFloat((rand() * 8 * (smokingStatus === 'current' ? 0.7 : 1.1)).toFixed(1));
    const dietQualityScore = Math.round(25 + rand() * 65); // 25 - 90
    const sleepHours = parseFloat((5.0 + rand() * 4.0).toFixed(1));

    // Underlying metabolic tendency
    const metabolicRisk = 
      (age - 45) * 0.03 +
      (familyHistory ? 0.75 : 0) +
      (smokingStatus === 'current' ? 0.45 : smokingStatus === 'former' ? 0.15 : -0.1) -
      (physicalActivityHours - 3.5) * 0.12 -
      (dietQualityScore - 55) * 0.015 +
      (sleepHours < 6 ? 0.3 : sleepHours > 8.5 ? 0.15 : -0.1);

    // BMI: strongly influenced by diet, activity, age
    const baseBmi = 22.0 + Math.max(0, metabolicRisk * 3.5) + rand() * 11;
    const bmi = parseFloat(Math.min(48, Math.max(18.5, baseBmi)).toFixed(1));

    // Blood Pressure
    const bpSysBase = 105 + (age * 0.45) + (bmi > 30 ? 14 : bmi > 25 ? 6 : 0) + (rand() * 22 - 11);
    const bloodPressureSys = Math.round(Math.min(185, Math.max(95, bpSysBase)));
    const bloodPressureDia = Math.round(Math.min(115, Math.max(60, 65 + (bloodPressureSys - 100) * 0.45 + (rand() * 10 - 5))));

    // Fasting Glucose (mg/dL) & HbA1c (%)
    // Normal fasting: 70-99. Impaired: 100-125. Diabetic: >=126.
    let glucoseBase = 84 + (metabolicRisk * 12) + (bmi > 30 ? 12 : 0) + (familyHistory ? 8 : 0) + (rand() * 32 - 16);
    // Add long tail for diabetic population
    if (metabolicRisk > 0.8 && rand() > 0.3) {
      glucoseBase += 35 + rand() * 45;
    }
    const glucose = Math.round(Math.min(260, Math.max(68, glucoseBase)));

    // HbA1c strongly tracks glucose: HbA1c approx (glucose + 46.7) / 28.7 plus biologic variance
    const calculatedHbA1c = (glucose + 46.7) / 28.7 + (rand() * 0.7 - 0.35);
    const hba1c = parseFloat(Math.min(13.5, Math.max(4.6, calculatedHbA1c)).toFixed(1));

    // Fasting Insulin (uU/mL) - correlates with insulin resistance & BMI
    const insulinBase = 5 + (bmi > 30 ? 15 : bmi > 25 ? 7 : 0) + (glucose > 115 ? 12 : 0) + rand() * 16;
    const insulin = Math.round(Math.min(65, Math.max(2, insulinBase)));

    // Lipids
    const cholesterolTotal = Math.round(150 + rand() * 95 + (bmi > 28 ? 18 : 0));
    const hdlBase = 58 - (bmi > 28 ? 12 : 0) - (sex === 'male' ? 6 : 0) + (physicalActivityHours * 2.2) + (rand() * 14 - 7);
    const hdlCholesterol = Math.round(Math.min(85, Math.max(26, hdlBase)));

    // Determine ground truth clinical diabetes outcome based on ADA clinical criteria + risk probability
    // ADA diagnostic criteria: FPG >= 126 or HbA1c >= 6.5 defines diabetes
    const clinicallyDiagnostic = glucose >= 126 || hba1c >= 6.5;
    
    // Logistic risk latent score
    const z = -4.5 + 
      0.038 * (glucose - 95) +
      1.15 * (hba1c - 5.5) +
      0.075 * (bmi - 25) +
      0.025 * (age - 45) +
      (familyHistory ? 0.65 : 0) +
      0.012 * (bloodPressureSys - 120) -
      0.08 * physicalActivityHours +
      (smokingStatus === 'current' ? 0.35 : 0) -
      0.015 * (dietQualityScore - 50);

    const prob = 1 / (1 + Math.exp(-z));
    const outcome: 0 | 1 = clinicallyDiagnostic ? 1 : prob > 0.45 ? (rand() < 0.85 ? 1 : 0) : (rand() < 0.08 ? 1 : 0);

    records.push({
      id: `PAT-${String(1000 + i).padStart(5, '0')}`,
      age,
      sex,
      glucose,
      hba1c,
      bmi,
      bloodPressureSys,
      bloodPressureDia,
      insulin,
      cholesterolTotal,
      hdlCholesterol,
      physicalActivityHours,
      smokingStatus,
      familyHistory,
      dietQualityScore,
      sleepHours,
      outcome,
      predictedRiskScore: Math.round(prob * 100)
    });
  }

  return records;
}

export const HISTORICAL_DATASET = generateHistoricalCohort(1200);

// Sample preset patients for instant clinical simulation
export const PATIENT_PRESETS: { name: string; description: string; data: Omit<PatientRecord, 'id' | 'outcome' | 'predictedRiskScore'> }[] = [
  {
    name: 'Typical Pre-diabetic',
    description: 'Elevated fasting glucose (114 mg/dL), HbA1c 6.0%, moderate overweight with sedentary job',
    data: {
      age: 49,
      sex: 'male',
      glucose: 114,
      hba1c: 6.0,
      bmi: 28.6,
      bloodPressureSys: 132,
      bloodPressureDia: 84,
      insulin: 18,
      cholesterolTotal: 215,
      hdlCholesterol: 42,
      physicalActivityHours: 1.5,
      smokingStatus: 'never',
      familyHistory: true,
      dietQualityScore: 48,
      sleepHours: 6.5
    }
  },
  {
    name: 'High-Risk Metabolic Patient',
    description: 'Impaired glucose (138 mg/dL), HbA1c 6.7%, Class I obesity, hypertension, strong family history',
    data: {
      age: 58,
      sex: 'female',
      glucose: 138,
      hba1c: 6.7,
      bmi: 33.4,
      bloodPressureSys: 144,
      bloodPressureDia: 90,
      insulin: 28,
      cholesterolTotal: 238,
      hdlCholesterol: 38,
      physicalActivityHours: 0.5,
      smokingStatus: 'current',
      familyHistory: true,
      dietQualityScore: 36,
      sleepHours: 5.5
    }
  },
  {
    name: 'Young Active Adult (Low Risk)',
    description: 'Normal markers, optimal fasting glucose (88 mg/dL), regular cardio exercise, clean diet',
    data: {
      age: 29,
      sex: 'female',
      glucose: 88,
      hba1c: 5.1,
      bmi: 21.8,
      bloodPressureSys: 112,
      bloodPressureDia: 72,
      insulin: 8,
      cholesterolTotal: 172,
      hdlCholesterol: 62,
      physicalActivityHours: 5.0,
      smokingStatus: 'never',
      familyHistory: false,
      dietQualityScore: 82,
      sleepHours: 7.5
    }
  },
  {
    name: 'Senior with Borderline Glycemia',
    description: 'Age 72, controlled blood pressure on medication, fasting glucose 106 mg/dL, HbA1c 5.9%',
    data: {
      age: 72,
      sex: 'male',
      glucose: 106,
      hba1c: 5.9,
      bmi: 26.2,
      bloodPressureSys: 128,
      bloodPressureDia: 78,
      insulin: 14,
      cholesterolTotal: 195,
      hdlCholesterol: 48,
      physicalActivityHours: 3.0,
      smokingStatus: 'former',
      familyHistory: false,
      dietQualityScore: 65,
      sleepHours: 7.0
    }
  }
];
