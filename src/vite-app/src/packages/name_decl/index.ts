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

const transliterationEnMap = {
  А: 'A',
  а: 'a',
  Б: 'B',
  б: 'b',
  В: 'V',
  в: 'v',
  Г: 'G',
  г: 'g',
  Д: 'D',
  д: 'd',
  Е: 'E',
  е: 'e',
  Ё: 'Yo',
  ё: 'yo',
  Ж: 'Zh',
  ж: 'zh',
  З: 'Z',
  з: 'z',
  И: 'I',
  и: 'i',
  Й: 'Y',
  й: 'y',
  К: 'K',
  к: 'k',
  Л: 'L',
  л: 'l',
  М: 'M',
  м: 'm',
  Н: 'N',
  н: 'n',
  О: 'O',
  о: 'o',
  П: 'P',
  п: 'p',
  Р: 'R',
  р: 'r',
  С: 'S',
  с: 's',
  Т: 'T',
  т: 't',
  У: 'U',
  у: 'u',
  Ф: 'F',
  ф: 'f',
  Х: 'Kh',
  х: 'kh',
  Ц: 'Ts',
  ц: 'ts',
  Ч: 'Ch',
  ч: 'ch',
  Ш: 'Sh',
  ш: 'sh',
  Щ: 'Shch',
  щ: 'shch',
  Ъ: '',
  ъ: '',
  Ы: 'Y',
  ы: 'y',
  Ь: '',
  ь: '',
  Э: 'E',
  э: 'e',
  Ю: 'Yu',
  ю: 'yu',
  Я: 'Ya',
  я: 'ya',
};

const transliterationUzMap = {
  А: 'A',
  а: 'a',
  Б: 'B',
  б: 'b',
  В: 'V',
  в: 'v',
  Г: 'G',
  г: 'g',
  Д: 'D',
  д: 'd',
  Е: 'E',
  е: 'e',
  Ё: 'Yo',
  ё: 'yo',
  Ж: 'J',
  ж: 'j', // отличие!
  З: 'Z',
  з: 'z',
  И: 'I',
  и: 'i',
  Й: 'Y',
  й: 'y',
  К: 'K',
  к: 'k',
  Л: 'L',
  л: 'l',
  М: 'M',
  м: 'm',
  Н: 'N',
  н: 'n',
  О: 'O',
  о: 'o',
  П: 'P',
  п: 'p',
  Р: 'R',
  р: 'r',
  С: 'S',
  с: 's',
  Т: 'T',
  т: 't',
  У: 'U',
  у: 'u',
  Ф: 'F',
  ф: 'f',
  Х: 'X',
  х: 'x',
  Ц: 'S',
  ц: 's',
  Ч: 'Ch',
  ч: 'ch',
  Ш: 'Sh',
  ш: 'sh',
  Щ: 'Sh',
  щ: 'sh',
  Ъ: '',
  ъ: '',
  Ы: 'I',
  ы: 'i',
  Ь: '',
  ь: '',
  Э: 'E',
  э: 'e',
  Ю: 'Yu',
  ю: 'yu',
  Я: 'Ya',
  я: 'ya',
  Ў: 'O‘',
  ў: 'o‘',
  Қ: 'Q',
  қ: 'q',
  Ғ: 'G‘',
  ғ: 'g‘',
  Ҳ: 'H',
  ҳ: 'h',
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
  if (count > 1 && count < 5) {
    return few;
  }

  if (count === 1) {
    return one;
  }

  return many;
}
