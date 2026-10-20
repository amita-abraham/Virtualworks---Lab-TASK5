import React, { useState, useMemo } from 'react';
import { PatientInput, ModelType } from '../types';
import { predictPatientRisk } from '../utils/mlEngine';
import { PATIENT_PRESETS } from '../data/patientDataset';
import { 
  Activity, 
  Heart, 
  Scale, 
  Clock, 
  Apple, 
  Cigarette, 
  Users, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const PatientPredictor: React.FC = () => {
  const [patient, setPatient] = useState<PatientInput>({
    age: 52,
    sex: 'male',
    glucose: 118,
    hba1c: 6.1,
    bmi: 29.4,
    bloodPressureSys: 134,
    bloodPressureDia: 86,
    insulin: 17,
    cholesterolTotal: 218,
    hdlCholesterol: 41,
    physicalActivityHours: 1.5,
    smokingStatus: 'former',
    familyHistory: true,
    dietQualityScore: 48,
    sleepHours: 6.5,
  });

  const [modelType, setModelType] = useState<ModelType>('logistic_regression');

  const prediction = useMemo(() => {
    return predictPatientRisk(patient, modelType);
  }, [patient, modelType]);

  const handlePresetSelect = (presetIndex: number) => {
    const selected = PATIENT_PRESETS[presetIndex].data;
    setPatient({ ...selected });
  };

  const handleResetToBaseline = () => {
    setPatient({
      age: 45,
      sex: 'female',
      glucose: 92,
      hba1c: 5.3,
      bmi: 24.2,
      bloodPressureSys: 118,
      bloodPressureDia: 76,
      insulin: 10,
      cholesterolTotal: 185,
      hdlCholesterol: 55,
      physicalActivityHours: 3.5,
      smokingStatus: 'never',
      familyHistory: false,
      dietQualityScore: 70,
      sleepHours: 7.5,
    });
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Clinical Stratification</span>
            <span aria-hidden="true">·</span>
            <span>ADA 2026 Standards of Care</span>
            <span aria-hidden="true">·</span>
            <span>Multivariate ML Inference</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Patient Diabetes Risk Simulator
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Simulate 3-year Type 2 diabetes risk by calibrating patient biomarkers against demographic and lifestyle drivers. Features real-time feature attribution decomposition.
          </p>
        </div>

        {/* Model Selector & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setModelType('logistic_regression')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                modelType === 'logistic_regression'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Logistic Regression
            </button>
            <button
              onClick={() => setModelType('random_forest')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                modelType === 'random_forest'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Random Forest
            </button>
            <button
              onClick={() => setModelType('gradient_boosting')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                modelType === 'gradient_boosting'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gradient Boosting
            </button>
          </div>
          <button
            onClick={handleResetToBaseline}
            title="Reset to clinical baseline"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Profiles Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Rapid Clinical Archetype Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PATIENT_PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(idx)}
              className="text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all group"
            >
              <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>{preset.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Clinical & Lifestyle Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Glycemic Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Glycemic & Metabolic Markers
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">FPG & HbA1c</span>
            </div>

            <div className="space-y-5">
              {/* Fasting Plasma Glucose */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Fasting Plasma Glucose</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-base font-bold text-slate-900 tabular-nums">{patient.glucose}</span>
                    <span className="text-slate-400 text-xs">mg/dL</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="65"
                  max="240"
                  step="1"
                  value={patient.glucose}
                  onChange={(e) => setPatient({ ...patient, glucose: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>Normal (&lt;100)</span>
                  <span className="text-amber-600 font-medium">Impaired (100-125)</span>
                  <span className="text-rose-600 font-medium">Diabetic (≥126)</span>
                </div>
              </div>

              {/* Glycated Hemoglobin HbA1c */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Glycated Hemoglobin (HbA1c)</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-base font-bold text-slate-900 tabular-nums">{patient.hba1c.toFixed(1)}</span>
                    <span className="text-slate-400 text-xs">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="4.5"
                  max="12.0"
                  step="0.1"
                  value={patient.hba1c}
                  onChange={(e) => setPatient({ ...patient, hba1c: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>Optimal (&lt;5.7%)</span>
                  <span className="text-amber-600 font-medium">Prediabetes (5.7–6.4%)</span>
                  <span className="text-rose-600 font-medium">Diabetes (≥6.5%)</span>
                </div>
              </div>

              {/* Fasting Insulin */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Fasting Serum Insulin</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-base font-bold text-slate-900 tabular-nums">{patient.insulin}</span>
                    <span className="text-slate-400 text-xs">µU/mL</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="2"
                  max="55"
                  step="1"
                  value={patient.insulin}
                  onChange={(e) => setPatient({ ...patient, insulin: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>Sensitive (2 - 12)</span>
                  <span>Moderate (13 - 24)</span>
                  <span className="text-amber-600 font-medium">Hyperinsulinemia (&gt;25)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Vitals & Adiposity */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Anthropometrics & Hemodynamics
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">BMI & BP</span>
            </div>

            <div className="space-y-5">
              {/* BMI */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Body Mass Index (BMI)</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-base font-bold text-slate-900 tabular-nums">{patient.bmi.toFixed(1)}</span>
                    <span className="text-slate-400 text-xs">kg/m²</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="18.5"
                  max="46.0"
                  step="0.1"
                  value={patient.bmi}
                  onChange={(e) => setPatient({ ...patient, bmi: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>Normal (18.5-24.9)</span>
                  <span className="text-amber-600 font-medium">Overweight (25-29.9)</span>
                  <span className="text-rose-600 font-medium">Obesity (≥30)</span>
                </div>
              </div>

              {/* Blood Pressure Systolic & Diastolic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">Systolic Blood Pressure</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-base font-bold text-slate-900 tabular-nums">{patient.bloodPressureSys}</span>
                      <span className="text-slate-400 text-xs">mmHg</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="95"
                    max="180"
                    step="1"
                    value={patient.bloodPressureSys}
                    onChange={(e) => setPatient({ ...patient, bloodPressureSys: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>Optimal (&lt;120)</span>
                    <span className="text-rose-600 font-medium">Stage 1 (≥130)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">Diastolic Blood Pressure</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-base font-bold text-slate-900 tabular-nums">{patient.bloodPressureDia}</span>
                      <span className="text-slate-400 text-xs">mmHg</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="115"
                    step="1"
                    value={patient.bloodPressureDia}
                    onChange={(e) => setPatient({ ...patient, bloodPressureDia: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>Optimal (&lt;80)</span>
                    <span className="text-rose-600 font-medium">High (≥90)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Lifestyle & Demographics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Lifestyle Demographics & Behavioral Factors
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Age, Exercise, Diet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Age */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Patient Age</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-base font-bold text-slate-900 tabular-nums">{patient.age}</span>
                    <span className="text-slate-400 text-xs">years</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="1"
                  value={patient.age}
                  onChange={(e) => setPatient({ ...patient, age: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
              </div>

              {/* Biological Sex */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Biological Sex</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPatient({ ...patient, sex: 'male' })}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      patient.sex === 'male'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatient({ ...patient, sex: 'female' })}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      patient.sex === 'female'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Physical Activity */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Physical Activity</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-base font-bold text-slate-900 tabular-nums">{patient.physicalActivityHours.toFixed(1)}</span>
                    <span className="text-slate-400 text-xs">hrs/wk</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.5"
                  value={patient.physicalActivityHours}
                  onChange={(e) => setPatient({ ...patient, physicalActivityHours: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span className="text-amber-600">Sedentary (&lt;1.5)</span>
                  <span className="text-emerald-600 font-medium">Target (≥2.5)</span>
                </div>
              </div>

              {/* Diet Quality Score */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Diet Quality (DASH / Med.)</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-base font-bold text-slate-900 tabular-nums">{patient.dietQualityScore}</span>
                    <span className="text-slate-400 text-xs">/ 100</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  step="1"
                  value={patient.dietQualityScore}
                  onChange={(e) => setPatient({ ...patient, dietQualityScore: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>Western / Refined</span>
                  <span className="text-emerald-600 font-medium">High Fiber Adherence</span>
                </div>
              </div>

              {/* Family History */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">First-Degree Family History</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPatient({ ...patient, familyHistory: false })}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      !patient.familyHistory
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    No Family History
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatient({ ...patient, familyHistory: true })}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      patient.familyHistory
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Parent / Sibling with T2D
                  </button>
                </div>
              </div>

              {/* Smoking Status */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Smoking Status</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['never', 'former', 'current'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPatient({ ...patient, smokingStatus: status })}
                      className={`py-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                        patient.smokingStatus === status
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive Results, Risk Gauge & Feature Waterfall (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Risk Score Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Predictive Stratification Result
            </div>

            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <div className="text-4xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                  {prediction.riskScore}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Estimated 3-Year Diabetes Risk Probability
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                  prediction.riskCategory === 'High Risk'
                    ? 'bg-rose-100 text-rose-800'
                    : prediction.riskCategory === 'Moderate Risk'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {prediction.riskCategory === 'High Risk' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {prediction.riskCategory === 'Moderate Risk' && <AlertCircle className="w-3.5 h-3.5" />}
                  {prediction.riskCategory === 'Low Risk' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {prediction.riskCategory}
                </span>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Cutoff: &gt;45% triage threshold
                </div>
              </div>
            </div>

            {/* Risk Gauge Bar */}
            <div className="mt-5 space-y-2">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: '20%' }} />
                <div className="h-full bg-amber-400" style={{ width: '30%' }} />
                <div className="h-full bg-rose-500" style={{ width: '50%' }} />
              </div>
              <div className="relative w-full h-2">
                <div 
                  className="absolute -top-1 w-3 h-3 bg-slate-900 rounded-full border-2 border-white shadow-md transform -translate-x-1/2"
                  style={{ left: `${Math.min(98, Math.max(2, prediction.riskScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Low</span>
                <span>20% Moderate</span>
                <span>50% High Risk</span>
                <span>100%</span>
              </div>
            </div>

            {/* Recommended Clinical Next Step */}
            <div className="mt-5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-900 mb-1">
                Triage Recommendation:
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {prediction.recommendedFollowUp}
              </p>
            </div>
          </div>

          {/* Feature Attribution (Waterfall / SHAP Breakdown) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Feature Risk Drivers
              </h2>
              <span className="text-xs text-slate-500 font-mono">Attribution Magnitude</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Relative contribution of each clinical biomarker and lifestyle demographic factor to this patient's prediction.
            </p>

            <div className="space-y-3">
              {prediction.featureAttributions.map((item) => {
                const isRisk = item.attribution > 0;
                const absAttr = Math.min(100, Math.abs(item.attribution) * 4);

                return (
                  <div key={item.featureKey} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span>{item.featureName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({item.patientValue})</span>
                      </div>
                      <div className={`font-mono font-bold tabular-nums ${isRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isRisk ? `+${item.attribution}%` : `${item.attribution}%`}
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                      {!isRisk ? (
                        <div 
                          className="h-full bg-emerald-500 rounded-full ml-auto"
                          style={{ width: `${absAttr}%` }}
                        />
                      ) : (
                        <div 
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${absAttr}%` }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>{item.description}</span>
                      <span className="font-mono">Ref: {item.clinicalNormalRange}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Action Plan & Lifestyle Guidance */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              Evidence-Based Interventions
            </h2>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Clinical Diagnostic Actions
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {prediction.clinicalActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold shrink-0">·</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5 text-emerald-600" />
                  Prescribed Lifestyle Interventions
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {prediction.lifestylePrescriptions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">·</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
