import { describe, expect, it } from 'vitest';
import { coldAssessment } from '../src/assessment';

describe('coldAssessment', () => {
  it('returns insufficient data for an empty selection', () => {
    expect(coldAssessment([], 2).title).toBe('Недостаточно данных');
  });

  it('returns cold or allergy for sneezing and runny nose', () => {
    expect(coldAssessment(['sneezing', 'runnyNose'], 3).title).toBe('Вероятно, простуда или аллергия');
  });

  it('recognizes flu-like symptoms', () => {
    expect(coldAssessment(['fever', 'aches', 'fatigue'], 2).title).toBe('Вероятно, гриппоподобное заболевание');
  });
});
