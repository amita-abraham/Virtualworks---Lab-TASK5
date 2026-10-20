import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

interface PatientValues {
  glucose: number;
  hba1c: number;
  bmi: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  insulin: number;
  age: number;
  sex: 'male' | 'female';
  physicalActivityHours: number;
  smokingStatus: 'never' | 'former' | 'current';
  familyHistory: boolean;
}

export default function App() {
  // Input state with standard baseline values
  const [values, setValues] = useState<PatientValues>({
    glucose: 108,
    hba1c: 5.8,
    bmi: 27.5,
    bloodPressureSys: 128,
    bloodPressureDia: 82,
    insulin: 14,
    age: 48,
    sex: 'male',
    physicalActivityHours: 2.0,
    smokingStatus: 'never',
    familyHistory: true,
  });

  // Logistic Regression Model Coefficients
  // Log-odds z = intercept + sum(beta_i * (x_i - baseline_i))
  const calculateRisk = () => {
    const intercept = -3.85;

    // Deltas from clinical population baselines
    const deltaGlucose = values.glucose - 92;
    const deltaHba1c = values.hba1c - 5.3;
    const deltaBmi = values.bmi - 24.5;
    const deltaBpSys = values.bloodPressureSys - 120;
    const deltaAge = values.age - 45;
    const deltaInsulin = values.insulin - 10;
    const deltaActivity = values.physicalActivityHours - 3.5;

    const smokingVal = values.smokingStatus === 'current' ? 0.42 : values.smokingStatus === 'former' ? 0.14 : 0;
    const familyVal = values.familyHistory ? 0.72 : 0;
    const sexVal = values.sex === 'male' ? 0.15 : 0;

    const z = intercept +
      (0.042 * deltaGlucose) +
      (1.25 * deltaHba1c) +
      (0.082 * deltaBmi) +
      (0.011 * deltaBpSys) +
      (0.022 * deltaInsulin) +
      (0.028 * deltaAge) -
      (0.11 * deltaActivity) +
      smokingVal +
      familyVal +
      sexVal;

    // Sigmoid probability function: P = 1 / (1 + exp(-z))
    const probability = 1 / (1 + Math.exp(-z));
    const scorePct = Math.min(99, Math.max(1, Math.round(probability * 100)));

    let category: 'Low Risk' | 'Moderate Risk' | 'High Risk' = 'Low Risk';
    let summary = 'Your markers indicate low 3-year risk. Maintain a balanced diet and regular physical activity.';

    if (scorePct >= 50 || values.glucose >= 126 || values.hba1c >= 6.5) {
      category = 'High Risk';
      summary = 'Your markers suggest elevated risk. We recommend scheduling a formal fasting plasma glucose or HbA1c test with a healthcare provider.';
    } else if (scorePct >= 20 || values.glucose >= 100 || values.hba1c >= 5.7) {
      category = 'Moderate Risk';
      summary = 'Early warning indicators present (prediabetes range). Increasing physical exercise and modest weight management can significantly lower your risk.';
    }

    // Key drivers
    const drivers: { name: string; impact: string; isRisk: boolean }[] = [];
    if (values.glucose >= 126) drivers.push({ name: 'Fasting Glucose', impact: `${values.glucose} mg/dL (Diabetic range ≥126)`, isRisk: true });
    else if (values.glucose >= 100) drivers.push({ name: 'Fasting Glucose', impact: `${values.glucose} mg/dL (Impaired fasting 100-125)`, isRisk: true });
    else drivers.push({ name: 'Fasting Glucose', impact: `${values.glucose} mg/dL (Optimal <100)`, isRisk: false });

    if (values.hba1c >= 6.5) drivers.push({ name: 'HbA1c', impact: `${values.hba1c}% (Diabetic threshold ≥6.5%)`, isRisk: true });
    else if (values.hba1c >= 5.7) drivers.push({ name: 'HbA1c', impact: `${values.hba1c}% (Prediabetic range 5.7-6.4%)`, isRisk: true });
    else drivers.push({ name: 'HbA1c', impact: `${values.hba1c}% (Optimal <5.7%)`, isRisk: false });

    if (values.bmi >= 30) drivers.push({ name: 'BMI', impact: `${values.bmi} kg/m² (Obese range)`, isRisk: true });
    else if (values.bmi >= 25) drivers.push({ name: 'BMI', impact: `${values.bmi} kg/m² (Overweight)`, isRisk: true });
    else drivers.push({ name: 'BMI', impact: `${values.bmi} kg/m² (Healthy weight)`, isRisk: false });

    if (values.familyHistory) drivers.push({ name: 'Family History', impact: 'First-degree relative with Type 2 diabetes', isRisk: true });

    return {
      scorePct,
      category,
      summary,
      zScore: z.toFixed(2),
      drivers
    };
  };

  const riskResult = calculateRisk();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Clean Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              Diabetes Risk Predictor
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-mono">
              · Logistic Regression
            </span>
          </div>
        </div>
      </header>

      {/* Main Single Page Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Heading */}
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Predictive Patient Risk Calculator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter clinical markers and lifestyle demographics to compute your 3-year Type 2 diabetes risk score.
          </p>
        </div>

        {/* 2-Column Split: Form on Left, Output on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Input Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Clinical Biomarkers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fasting Glucose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fasting Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  min="60"
                  max="300"
                  value={values.glucose}
                  onChange={(e) => setValues({ ...values, glucose: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent tabular-nums"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Normal: 70–99 · Impaired: 100–125
                </span>
              </div>

              {/* HbA1c */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HbA1c (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="14.0"
                  value={values.hba1c}
                  onChange={(e) => setValues({ ...values, hba1c: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent tabular-nums"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Normal: &lt;5.7% · Prediabetes: 5.7–6.4%
                </span>
              </div>

              {/* BMI */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  BMI (kg/m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="16.0"
                  max="55.0"
                  value={values.bmi}
                  onChange={(e) => setValues({ ...values, bmi: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent tabular-nums"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Normal: 18.5–24.9 · Overweight: 25–29.9
                </span>
              </div>

              {/* Systolic Blood Pressure */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  min="80"
                  max="220"
                  value={values.bloodPressureSys}
                  onChange={(e) => setValues({ ...values, bloodPressureSys: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent tabular-nums"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Optimal: &lt;120 · Elevated: 120–129
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                2. Lifestyle &amp; Demographics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="95"
                    value={values.age}
                    onChange={(e) => setValues({ ...values, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent tabular-nums"
                  />
                </div>

                {/* Biological Sex */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setValues({ ...values, sex: 'male' })}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        values.sex === 'male'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setValues({ ...values, sex: 'female' })}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        values.sex === 'female'
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Activity (hrs/week)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={values.physicalActivityHours}
                    onChange={(e) => setValues({ ...values, physicalActivityHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent tabular-nums"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Target: &ge; 2.5 hrs/week
                  </span>
                </div>

                {/* Family History */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Family History of Diabetes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setValues({ ...values, familyHistory: false })}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        !values.familyHistory
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setValues({ ...values, familyHistory: true })}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        values.familyHistory
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Yes (Parent/Sibling)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors text-center"
              >
                Calculate Diabetic Risk Score
              </button>
            </div>
          </div>

          {/* Right Column: Instant Risk Score Output (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Logistic Regression Result
              </div>

              {/* Large Score Display */}
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-5">
                <div>
                  <div className="text-5xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                    {riskResult.scorePct}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Predicted 3-Year Diabetes Risk
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    riskResult.category === 'High Risk'
                      ? 'bg-rose-100 text-rose-800'
                      : riskResult.category === 'Moderate Risk'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {riskResult.category === 'High Risk' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {riskResult.category === 'Moderate Risk' && <AlertCircle className="w-3.5 h-3.5" />}
                    {riskResult.category === 'Low Risk' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {riskResult.category}
                  </span>
                </div>
              </div>

              {/* Progression Bar */}
              <div className="mt-5 space-y-1.5">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: '20%' }} />
                  <div className="h-full bg-amber-400" style={{ width: '30%' }} />
                  <div className="h-full bg-rose-500" style={{ width: '50%' }} />
                </div>
                <div className="relative w-full h-2">
                  <div
                    className="absolute -top-1 w-3 h-3 bg-slate-900 rounded-full border-2 border-white shadow-xs transform -translate-x-1/2"
                    style={{ left: `${Math.min(98, Math.max(2, riskResult.scorePct))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% Low</span>
                  <span>20% Moderate</span>
                  <span>50% High</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Summary message */}
              <div className="mt-5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {riskResult.summary}
              </div>

              {/* Key Factor Drivers */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Observed Factor Breakdown
                </div>
                <div className="space-y-1.5">
                  {riskResult.drivers.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-800">{d.name}</span>
                      <span className={`font-mono text-[11px] ${d.isRisk ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                        {d.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mathematical Equation Expander */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-mono space-y-1">
                  <div>Log-Odds (z): <span className="font-bold text-slate-700">{riskResult.zScore}</span></div>
                  <div>Formula: P = 1 / (1 + e^-(z)) = <span className="font-bold text-slate-700">{(riskResult.scorePct / 100).toFixed(3)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
