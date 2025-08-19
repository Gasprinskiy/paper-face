import { Gender } from '@/shared/types';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';

export const GenderNameByKey: Record<Gender, string> = {
  [Gender.MALE]: 'муж.',
  [Gender.FEMALE]: 'жен.',
};

export const GenderOptions: SelectMixedOption[] = [
  {
    value: Gender.MALE,
    label: GenderNameByKey[Gender.MALE],
  },
  {
    value: Gender.FEMALE,
    label: GenderNameByKey[Gender.FEMALE],
  },
];
