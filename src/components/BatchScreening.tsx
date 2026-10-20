import React, { useState, useMemo } from 'react';
import { HISTORICAL_DATASET } from '../data/patientDataset';
import { scorePatientRecord, predictPatientRisk } from '../utils/mlEngine';
import { PatientRecord, PredictionResult } from '../types';
import { 
  Download, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpDown,
  FileSpreadsheet,
  X
} from 'lucide-react';

export const BatchScreening: React.FC = () => {
  // Use first 50 patients from historical dataset as ambulatory clinic batch intake
  const batchCohort = useMemo(() => {
    return HISTORICAL_DATASET.slice(0, 50).map(patient => {
      const prob = scorePatientRecord(patient, 'logistic_regression');
      const score = Math.round(prob * 100);
      let tier: 'High Risk' | 'Moderate Risk' | 'Low Risk' = 'Low Risk';
      if (score >= 50 || patient.glucose >= 126 || patient.hba1c >= 6.5) {
        tier = 'High Risk';
      } else if (score >= 20 || patient.glucose >= 100 || patient.hba1c >= 5.7) {
        tier = 'Moderate Risk';
      }
      return {
        ...patient,
        predictedRiskScore: score,
        tier
      };
    });
  }, []);

  const [tierFilter, setTierFilter] = useState<'all' | 'High Risk' | 'Moderate Risk' | 'Low Risk'>('all');
  const [selectedPatient, setSelectedPatient] = useState<(PatientRecord & { tier: string; predictedRiskScore: number }) | null>(null);

  const filteredBatch = useMemo(() => {
    if (tierFilter === 'all') return batchCohort;
    return batchCohort.filter(p => p.tier === tierFilter);
  }, [batchCohort, tierFilter]);

  const highRiskCount = batchCohort.filter(p => p.tier === 'High Risk').length;
  const modRiskCount = batchCohort.filter(p => p.tier === 'Moderate Risk').length;
  const lowRiskCount = batchCohort.filter(p => p.tier === 'Low Risk').length;

  const handleExportCsv = () => {
    const headers = [
      'Patient_ID', 'Age', 'Sex', 'Fasting_Glucose_mg_dL', 'HbA1c_pct', 'BMI',
      'BP_Sys', 'BP_Dia', 'Family_History', 'Predicted_Risk_Score_pct',
      'Clinical_Triage_Tier', 'Action_Protocol'
    ];

    const rows = batchCohort.map(p => [
      p.id,
      p.age,
      p.sex,
      p.glucose,
      p.hba1c,
      p.bmi,
      p.bloodPressureSys,
      p.bloodPressureDia,
      p.familyHistory ? 'Yes' : 'No',
      p.predictedRiskScore,
      p.tier,
      p.tier === 'High Risk'
        ? 'Urgent Diagnostic Confirmation: Repeat FPG / 2hr 75g OGTT'
        : p.tier === 'Moderate Risk'
        ? 'Enroll in Diabetes Prevention Program (DPP) & Repeat HbA1c in 3-6mo'
        : 'Routine Annual Wellness Screening'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'clinic_diabetes_batch_screening_triage.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedPatientPrediction = useMemo(() => {
    if (!selectedPatient) return null;
    return predictPatientRisk({
      age: selectedPatient.age,
      sex: selectedPatient.sex,
      glucose: selectedPatient.glucose,
      hba1c: selectedPatient.hba1c,
      bmi: selectedPatient.bmi,
      bloodPressureSys: selectedPatient.bloodPressureSys,
      bloodPressureDia: selectedPatient.bloodPressureDia,
      insulin: selectedPatient.insulin,
      cholesterolTotal: selectedPatient.cholesterolTotal,
      hdlCholesterol: selectedPatient.hdlCholesterol,
      physicalActivityHours: selectedPatient.physicalActivityHours,
      smokingStatus: selectedPatient.smokingStatus,
      familyHistory: selectedPatient.familyHistory,
      dietQualityScore: selectedPatient.dietQualityScore,
      sleepHours: selectedPatient.sleepHours,
    });
  }, [selectedPatient]);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Ambulatory Clinic Triage</span>
            <span aria-hidden="true">·</span>
            <span>Batch Intake Analytics</span>
            <span aria-hidden="true">·</span>
            <span>EHR Ready Export</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Batch Patient Screening &amp; Triage
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Execute automated predictive risk classification across inbound patient cohorts to prioritize clinical appointments and preventive care enrollment.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Clinical Triage (Excel / CSV)
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Batch Inbound
          </div>
          <div className="mt-1 text-3xl font-bold font-mono tabular-nums text-slate-900">
            {batchCohort.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Screened patients in queue</div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 bg-rose-50/20 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-800">
            High Priority Triage
          </div>
          <div className="mt-1 text-3xl font-bold font-mono tabular-nums text-rose-600">
            {highRiskCount}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Immediate diagnostic follow-up</div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
            Moderate / Prediabetes
          </div>
          <div className="mt-1 text-3xl font-bold font-mono tabular-nums text-amber-600">
            {modRiskCount}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Lifestyle DPP candidates</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Low Risk
          </div>
          <div className="mt-1 text-3xl font-bold font-mono tabular-nums text-slate-900">
            {lowRiskCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Routine wellness screening</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tierFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Patients ({batchCohort.length})
          </button>
          <button
            onClick={() => setTierFilter('High Risk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tierFilter === 'High Risk' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            High Risk ({highRiskCount})
          </button>
          <button
            onClick={() => setTierFilter('Moderate Risk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tierFilter === 'Moderate Risk' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Moderate Risk ({modRiskCount})
          </button>
          <button
            onClick={() => setTierFilter('Low Risk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tierFilter === 'Low Risk' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Low Risk ({lowRiskCount})
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Click any row to inspect individual patient feature drivers
        </div>
      </div>

      {/* Triage Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-3">Age / Sex</th>
                <th className="py-3 px-3">FPG (mg/dL)</th>
                <th className="py-3 px-3">HbA1c (%)</th>
                <th className="py-3 px-3">BMI (kg/m²)</th>
                <th className="py-3 px-3">Blood Pressure</th>
                <th className="py-3 px-3">Predicted Risk</th>
                <th className="py-3 px-3">Triage Priority</th>
                <th className="py-3 px-4 text-right">Clinical Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {filteredBatch.map((patient) => {
                const isHigh = patient.tier === 'High Risk';
                const isMod = patient.tier === 'Moderate Risk';

                return (
                  <tr
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {patient.id}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {patient.age}y · {patient.sex === 'male' ? 'M' : 'F'}
                    </td>
                    <td className={`py-3 px-3 font-semibold ${
                      patient.glucose >= 126 ? 'text-rose-600' : patient.glucose >= 100 ? 'text-amber-600' : 'text-slate-700'
                    }`}>
                      {patient.glucose}
                    </td>
                    <td className={`py-3 px-3 font-semibold ${
                      patient.hba1c >= 6.5 ? 'text-rose-600' : patient.hba1c >= 5.7 ? 'text-amber-600' : 'text-slate-700'
                    }`}>
                      {patient.hba1c.toFixed(1)}%
                    </td>
                    <td className={`py-3 px-3 ${patient.bmi >= 30 ? 'text-amber-700 font-medium' : 'text-slate-700'}`}>
                      {patient.bmi.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {patient.bloodPressureSys}/{patient.bloodPressureDia}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {patient.predictedRiskScore}%
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isMod
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {patient.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans text-xs text-slate-600">
                      {isHigh
                        ? 'Diagnostic FPG / OGTT'
                        : isMod
                        ? 'DPP Referral & 6mo HbA1c'
                        : 'Annual Wellness'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && selectedPatientPrediction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Patient Profile Audit
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-mono">
                  {selectedPatient.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">Predicted Risk</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {selectedPatient.predictedRiskScore}%
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">Fasting Glucose</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {selectedPatient.glucose} <span className="text-xs text-slate-400">mg/dL</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">HbA1c</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {selectedPatient.hba1c.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">BMI</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {selectedPatient.bmi.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Feature Drivers in Modal */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                Top Risk Drivers for this Patient
              </h4>
              <div className="space-y-2">
                {selectedPatientPrediction.featureAttributions.slice(0, 5).map((f) => (
                  <div key={f.featureKey} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="font-medium text-slate-800">{f.featureName} ({f.patientValue})</span>
                    <span className={`font-mono font-bold ${f.attribution > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {f.attribution > 0 ? `+${f.attribution}%` : `${f.attribution}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Protocol */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs space-y-2 text-slate-700">
              <div className="font-bold text-blue-900">Clinical Protocol Action:</div>
              <p>{selectedPatientPrediction.recommendedFollowUp}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
