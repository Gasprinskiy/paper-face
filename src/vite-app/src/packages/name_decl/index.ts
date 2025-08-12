import './morfer/index.min.js';
// @ts-expect-error freakint description
const morpher = new Morpher();

type RussianCase = | 'nominative' // именительный
  | 'genitive' // родительный
  | 'dative' // дательный
  | 'accusative' // винительный
  | 'instrumental' // творительный
  | 'prepositional'; // предложный

const caseMap: Record<RussianCase, string> = {
  nominative: 'именительный',
  genitive: 'родительный',
  dative: 'дательный',
  accusative: 'винительный',
  instrumental: 'творительный',
  prepositional: 'предложный',
};

/**
 * Declines a full Russian name (Last First) into the specified case.
 * @param fullName Full name in the format "LastName FirstName".
 * @param targetCase The case to decline to (English keyword).
 * @returns The declined form of the name.
 */
export async function declineWord(
  fullName: string,
  targetCase: RussianCase,
): Promise<string> {
  const result = await morpher.russian.declension(fullName);
  return result[caseMap[targetCase]];
}
