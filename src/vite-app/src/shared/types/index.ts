export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
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
}

export type SubjectOption = CommonOptionWithID;

export interface CreateFileNameParam extends CommonOption {
  gender_title: string;
}

export interface SubjectTypeOption extends CommonOption {
  type: string;
}
