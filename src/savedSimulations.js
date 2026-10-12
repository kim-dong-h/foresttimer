import { simulateAveraging } from './percent.js';
import { currencyForLanguage, pt } from './percentI18n.js';

export const SAVED_SIMULATIONS_KEY = 'foresttimer-percent-simulations';

function validRecord(record) {
  return record && typeof record.id === 'string' && typeof record.title === 'string'
    && record.title.trim().length > 0 && record.title.length <= 60
    && ['basePrice', 'dropPercent', 'profitPercent'].every(key => typeof record[key] === 'string')
    && simulateAveraging(record.basePrice, record.dropPercent, record.profitPercent, record.currency ?? 'KRW');
}

export function loadSavedSimulations(storage, currency) {
  try {
    const records = JSON.parse(storage.getItem(SAVED_SIMULATIONS_KEY));
    return Array.isArray(records) ? records.filter(record => validRecord(record) && (!currency || (record.currency ?? 'KRW') === currency)) : [];
  } catch {
    return [];
  }
}

export function saveSimulation(storage, titleInput, values, language = 'ko') {
  const title = titleInput.trim();
  const currency = currencyForLanguage(language);
  if (!title || title.length > 60) return { error: pt(language, 'nameError') };
  if (!simulateAveraging(values.basePrice, values.dropPercent, values.profitPercent, currency)) {
    return { error: pt(language, 'saveInputError') };
  }
  try {
    const record = { id: crypto.randomUUID(), title, ...values, currency };
    const records = [record, ...loadSavedSimulations(storage)];
    storage.setItem(SAVED_SIMULATIONS_KEY, JSON.stringify(records));
    return { records: records.filter(item => (item.currency ?? 'KRW') === currency), record };
  } catch {
    return { error: pt(language, 'saveError') };
  }
}
