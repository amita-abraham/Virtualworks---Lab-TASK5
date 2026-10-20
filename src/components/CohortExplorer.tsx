import React, { useState, useMemo } from 'react';
import { HISTORICAL_DATASET } from '../data/patientDataset';
import { PatientRecord } from '../types';
import { 
  Search, 
  Download, 
  ArrowUpDown,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const CohortExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | '0' | '1'>('all');
  const [glycemicFilter, setGlycemicFilter] = useState<'all' | 'normal' | 'impaired' | 'diabetic'>('all');
  const [sortField, setSortField] = useState<keyof PatientRecord>('glucose');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  // Cohort summary statistics
  const summaryStats = useMemo(() => {
    const total = HISTORICAL_DATASET.length;
    const positiveCount = HISTORICAL_DATASET.filter(p => p.outcome === 1).length;
    const prevalence = (positiveCount / total) * 100;
    const avgGlucose = HISTORICAL_DATASET.reduce((sum, p) => sum + p.glucose, 0) / total;
    const avgHbA1c = HISTORICAL_DATASET.reduce((sum, p) => sum + p.hba1c, 0) / total;
    const avgBmi = HISTORICAL_DATASET.reduce((sum, p) => sum + p.bmi, 0) / total;

    return {
      total,
      positiveCount,
      negativeCount: total - positiveCount,
      prevalence,
      avgGlucose,
      avgHbA1c,
      avgBmi
    };
  }, []);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return HISTORICAL_DATASET.filter((patient) => {
      // Search filter
      if (searchQuery && !patient.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Outcome filter
      if (outcomeFilter !== 'all') {
        const expected = parseInt(outcomeFilter, 10);
        if (patient.outcome !== expected) return false;
      }
      // Glycemic filter
      if (glycemicFilter === 'normal' && (patient.glucose >= 100 || patient.hba1c >= 5.7)) return false;
      if (glycemicFilter === 'impaired' && (patient.glucose < 100 || patient.glucose >= 126 || patient.hba1c >= 6.5)) return false;
      if (glycemicFilter === 'diabetic' && (patient.glucose < 126 && patient.hba1c < 6.5)) return false;

      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [searchQuery, outcomeFilter, glycemicFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const handleSort = (field: keyof PatientRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleDownloadCsv = () => {
    const headers = [
      'id', 'age', 'sex', 'glucose', 'hba1c', 'bmi',
      'bloodPressureSys', 'bloodPressureDia', 'insulin',
      'cholesterolTotal', 'hdlCholesterol', 'physicalActivityHours',
      'smokingStatus', 'familyHistory', 'dietQualityScore',
      'sleepHours', 'outcome'
    ];

    const rows = HISTORICAL_DATASET.map(r => [
      r.id, r.age, r.sex, r.glucose, r.hba1c, r.bmi,
      r.bloodPressureSys, r.bloodPressureDia, r.insulin,
      r.cholesterolTotal, r.hdlCholesterol, r.physicalActivityHours,
      r.smokingStatus, r.familyHistory ? 1 : 0, r.dietQualityScore,
      r.sleepHours, r.outcome
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'diabetes_historical_cohort_1200.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Historical Healthcare Cohort</span>
            <span aria-hidden="true">·</span>
            <span>1,200 Patient Records</span>
            <span aria-hidden="true">·</span>
            <span>Ground Truth Outcomes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Clinical Cohort Dataset Explorer
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Explore and audit the historical healthcare records used for predictive model training. Download the raw CSV for Excel or Python Pandas workflows.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          Download Cohort CSV (1,200 records)
        </button>
      </div>

      {/* Cohort KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Cohort Size
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summaryStats.total.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            De-identified patient records
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Diabetes Prevalence
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-rose-600">
            {summaryStats.prevalence.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {summaryStats.positiveCount} confirmed cases
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Non-Diabetic Controls
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summaryStats.negativeCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Negative 3-year outcomes
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Mean Fasting Glucose
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summaryStats.avgGlucose.toFixed(0)} <span className="text-xs text-slate-400 font-normal">mg/dL</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Population central tendency
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Mean HbA1c
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summaryStats.avgHbA1c.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Glycated hemoglobin mean
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Mean Cohort BMI
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summaryStats.avgBmi.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kg/m²</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Overweight baseline avg
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID (e.g. PAT-01052)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => { setOutcomeFilter('all'); setPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                outcomeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Outcomes
            </button>
            <button
              onClick={() => { setOutcomeFilter('1'); setPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                outcomeFilter === '1' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diabetic (1)
            </button>
            <button
              onClick={() => { setOutcomeFilter('0'); setPage(1); }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                outcomeFilter === '0' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non-Diabetic (0)
            </button>
          </div>

          {/* Glycemic Filter */}
          <select
            value={glycemicFilter}
            onChange={(e) => { setGlycemicFilter(e.target.value as any); setPage(1); }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Glycemic Tiers</option>
            <option value="normal">Normal (FPG &lt;100 &amp; HbA1c &lt;5.7)</option>
            <option value="impaired">Impaired / Prediabetes (100-125)</option>
            <option value="diabetic">Diabetic Threshold (≥126 or ≥6.5%)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredRecords.length} matched records
        </div>
      </div>

      {/* Tabular Records Display */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">
                  <button onClick={() => handleSort('id')} className="flex items-center gap-1 hover:text-slate-900">
                    Patient ID <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('age')} className="flex items-center gap-1 hover:text-slate-900">
                    Age / Sex <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('glucose')} className="flex items-center gap-1 hover:text-slate-900">
                    Glucose (mg/dL) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('hba1c')} className="flex items-center gap-1 hover:text-slate-900">
                    HbA1c (%) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('bmi')} className="flex items-center gap-1 hover:text-slate-900">
                    BMI (kg/m²) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="py-3 px-3">BP (Sys/Dia)</th>
                <th className="py-3 px-3">Activity (hrs/wk)</th>
                <th className="py-3 px-3">Family History</th>
                <th className="py-3 px-4 text-right">
                  <button onClick={() => handleSort('outcome')} className="flex items-center gap-1 hover:text-slate-900 ml-auto">
                    Diagnosis <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((patient) => {
                  const isDiabetic = patient.outcome === 1;
                  const isHighGlycemic = patient.glucose >= 126 || patient.hba1c >= 6.5;

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {patient.id}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {patient.age} yrs · {patient.sex === 'male' ? 'M' : 'F'}
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
                      <td className="py-3 px-3 text-slate-600">
                        {patient.physicalActivityHours.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {patient.familyHistory ? 'Yes' : 'No'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-sans text-[11px] font-bold px-2 py-0.5 rounded ${
                          isDiabetic
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isDiabetic ? 'Diabetic (1)' : 'Control (0)'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No matching patient records found. Adjust your filters or query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <span className="font-mono font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-mono font-bold text-slate-900">{totalPages || 1}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
