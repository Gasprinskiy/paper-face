export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum LangCode {
  RU = 'ru',
  EN = 'en',
  UZ = 'uz',
}

export interface CommonOption {
  name: string;
  declension: string;
}

export interface CommonOptionWithID extends CommonOption {
  id: string;
}

export interface NameOption extends CommonOptionWithID {
  gender: Gender;
  decline?: boolean;
}

export interface SubjectOption extends CommonOptionWithID {
  lang_code: LangCode;
};

export interface CreateFileNameParam extends CommonOption {
  gender_title: string;
}

export interface SubjectTypeOption extends CommonOption {
  type: string;
}
