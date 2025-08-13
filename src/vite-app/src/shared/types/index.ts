export enum Gender {
  MALE = 'муж.',
  FEMALE = 'жен.',
}

export interface NameOption {
  name: string;
  declension: string;
  gender: Gender;
}

export interface SubjectOption {
  name: string;
  declension: string;
}

export interface CreateFileNameParam {
  gender_title: string;
  name: string;
  declension: string;
}
