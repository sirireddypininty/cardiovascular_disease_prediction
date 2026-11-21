const STORAGE_KEY = 'deepecg_analysis_history';

export function getAnalysisHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading analysis history:', e);
    return [];
  }
}

export function saveAnalysisRecord(record) {
  try {
    const history = getAnalysisHistory();
    const updated = [record, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving analysis record:', e);
  }
}

export function clearAnalysisHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing history:', e);
  }
}
