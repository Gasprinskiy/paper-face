import { LangCode } from '@/shared/types';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';

export const LangOptions: SelectMixedOption[] = [
  {
    value: LangCode.RU,
    label: 'RU',
  },
  {
    value: LangCode.EN,
    label: 'EN',
  },
  {
    value: LangCode.UZ,
    label: 'UZ',
  },
];
