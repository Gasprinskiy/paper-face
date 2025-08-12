import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface';
import { ActionMode } from './types';

export const DropDownOptions: DropdownMixedOption[] = [
  {
    label: 'Редактировать/добавить учеников',
    key: ActionMode.NAMES,
  },
  {
    label: 'Редактировать/добавить предметы',
    key: ActionMode.SUBJECTS,
  },
];
