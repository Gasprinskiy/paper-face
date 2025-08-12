export enum Gender {
  MALE = 'муж.',
  FEMALE = 'жен.',
}

export interface NameOption {
  name: string;
  declension: string;
  gender: Gender;
}
