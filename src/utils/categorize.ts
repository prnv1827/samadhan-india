import type { Challenge } from '../types';

const keywordMap: Record<string, string[]> = {
  'Water & Sanitation': [
  'water',
  'hand pump',
  'handpump',
  'borewell',
  'tap',
  'toilet',
  'drain',
  'sewage',
  'well'],

  'Roads & Transport': [
  'road',
  'pothole',
  'bridge',
  'bus',
  'transport',
  'culvert',
  'highway',
  'street'],

  'Waste Management': ['garbage', 'waste', 'dump', 'litter', 'trash', 'sanitation worker'],
  'Electricity & Energy': [
  'electric',
  'power',
  'transformer',
  'outage',
  'solar',
  'light',
  'voltage'],

  'Healthcare Access': [
  'hospital',
  'phc',
  'clinic',
  'doctor',
  'medicine',
  'ambulance',
  'health'],

  Education: ['school', 'teacher', 'student', 'dropout', 'classroom', 'anganwadi'],
  'Agriculture & Irrigation': [
  'crop',
  'farm',
  'irrigation',
  'canal',
  'seed',
  'harvest',
  'soil',
  'silt'],

  'Forest & Environment': ['forest', 'tree', 'pollution', 'river', 'wildlife', 'mining'],
  'Livelihood & Skills': ['job', 'employment', 'training', 'skill', 'wage', 'migrant'],
  'Digital Access': ['internet', 'network', 'mobile', 'signal', 'broadband', 'online']
};

export interface DomainSuggestion {
  domain: string;
  confidence: number;
}

export function suggestDomain(text: string): DomainSuggestion | null {
  const haystack = text.toLowerCase();
  if (haystack.trim().length < 12) return null;

  let best: {domain: string;hits: number;} | null = null;
  for (const [domain, keywords] of Object.entries(keywordMap)) {
    const hits = keywords.reduce(
      (total, keyword) => haystack.includes(keyword) ? total + 1 : total,
      0
    );
    if (hits > 0 && (!best || hits > best.hits)) best = { domain, hits };
  }
  if (!best) return null;

  return {
    domain: best.domain,
    confidence: Math.min(96, 68 + best.hits * 9)
  };
}

export function findSimilar(_title: string, _district: string): Challenge[] {
  // Similarity suggestions are intentionally disabled until there is live server data.
  return [];
}