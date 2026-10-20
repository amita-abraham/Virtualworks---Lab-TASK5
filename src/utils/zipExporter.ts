import JSZip from 'jszip';
import { GITHUB_REPO_FILES } from '../data/githubRepoFiles';
import { HISTORICAL_DATASET } from '../data/patientDataset';

export async function exportGitHubRepoZip(): Promise<void> {
  const zip = new JSZip();

  // 1. Add all repository root files
  for (const file of GITHUB_REPO_FILES) {
    zip.file(file.path, file.content);
  }

  // 2. Add complete 1,200 records dataset CSV into dataset/ folder
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
  zip.file('dataset/diabetes_historical_cohort.csv', csvContent);

  // 3. Generate the ZIP file and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'healthcare-diabetes-prediction-github-repo.zip');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
