import { INITIAL_DAYS, STORAGE_KEY } from '../data/sampleData';

const API_BASE = '/api/days';

export async function fetchDays() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      throw new Error(`API responded with ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      // Clean MongoDB _id if present
      const cleanData = data.map(({ _id, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
      return { days: cleanData, isCloud: true };
    } else if (Array.isArray(data) && data.length === 0) {
      // Cloud database is empty, seed it with sample data
      await syncAllDaysToCloud(INITIAL_DAYS);
      return { days: INITIAL_DAYS, isCloud: true };
    }
  } catch (err) {
    console.warn('Using local fallback (MongoDB not connected or local dev without serverless api):', err.message);
  }

  // Local fallback
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      return { days: JSON.parse(local), isCloud: false };
    }
  } catch (e) {
    console.error(e);
  }

  return { days: INITIAL_DAYS, isCloud: false };
}

export async function saveDayToCloud(day) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(day),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncAllDaysToCloud(days) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(days),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function deleteDayFromCloud(dayId) {
  try {
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(dayId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
