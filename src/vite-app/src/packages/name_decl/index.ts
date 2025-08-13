import './morfer/index.min.js';
// @ts-expect-error freakint description
const morpher = new Morpher();

type RussianCase = | 'nominative'
  | 'genitive'
  | 'dative'
  | 'accusative'
  | 'instrumental'
  | 'prepositional'
  | 'plural';

const caseMap: Record<RussianCase, string> = {
  nominative: 'именительный',
  genitive: 'родительный',
  dative: 'дательный',
  accusative: 'винительный',
  instrumental: 'творительный',
  prepositional: 'предложный',
  plural: 'множественное',
};

export async function declineWord(
  fullName: string,
  targetCase: RussianCase,
  plural: boolean = false,
): Promise<string> {
  const result = await morpher.russian.declension(fullName);
  if (plural) {
    return result[caseMap.plural][caseMap[targetCase]];
  }
  return result[caseMap[targetCase]];
}

export function pluralize(count: number, one: string, few: string, many: string): string {
  count = Math.abs(count) % 100;
  const lastDigit = count % 10;

  if (lastDigit > 1 && lastDigit < 5) {
    return few;
  }

  if (lastDigit === 1) {
    return one;
  }

  return many;
}
