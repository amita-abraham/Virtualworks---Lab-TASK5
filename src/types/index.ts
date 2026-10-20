export interface PatientRecord {
  id: string;
  age: number;
  sex: 'male' | 'female';
  glucose: number; // Fasting plasma glucose (mg/dL)
  hba1c: number; // HbA1c (%)
  bmi: number; // Body Mass Index (kg/m^2)
  bloodPressureSys: number; // Systolic BP (mmHg)
  bloodPressureDia: number; // Diastolic BP (mmHg)
  insulin: number; // Fasting insulin (uU/mL)
  cholesterolTotal: number; // Total cholesterol (mg/dL)
  hdlCholesterol: number; // HDL cholesterol (mg/dL)
  physicalActivityHours: number; // Moderate/vigorous hours/week
  smokingStatus: 'never' | 'former' | 'current';
  familyHistory: boolean; // First-degree relative with diabetes
  dietQualityScore: number; // 0-100 DASH/Mediterranean score
  sleepHours: number; // Average hours/night
  outcome: 0 | 1; // 0 = Negative, 1 = Positive Diabetes Diagnosis
  predictedRiskScore?: number; // 0 - 100
}

export interface PatientInput {
  age: number;
  sex: 'male' | 'female';
  glucose: number;
  hba1c: number;
  bmi: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  insulin: number;
  cholesterolTotal: number;
  hdlCholesterol: number;
  physicalActivityHours: number;
  smokingStatus: 'never' | 'former' | 'current';
  familyHistory: boolean;
  dietQualityScore: number;
  sleepHours: number;
}

export interface PredictionResult {
  riskScore: number; // 0 - 100%
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  recommendedFollowUp: string;
  clinicalActions: string[];
  lifestylePrescriptions: string[];
  featureAttributions: FeatureAttribution[];
}

export interface FeatureAttribution {
  featureKey: keyof PatientInput;
  featureName: string;
  patientValue: string | number;
  clinicalNormalRange: string;
  attribution: number; // positive = raises risk, negative = lowers risk
  category: 'clinical' | 'lifestyle';
  description: string;
}

export interface ModelMetrics {
  accuracy: number;
  sensitivity: number; // Recall
  specificity: number;
  precision: number;
  f1Score: number;
  auc: number;
  brierScore: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
    total: number;
  };
  rocPoints: { fpr: number; tpr: number; threshold: number }[];
  prPoints: { recall: number; precision: number; threshold: number }[];
  featureImportance: {
    name: string;
    key: string;
    importance: number;
    category: 'clinical' | 'lifestyle';
  }[];
}

export type ModelType = 'logistic_regression' | 'random_forest' | 'gradient_boosting';

export interface GitHubRepoFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}
