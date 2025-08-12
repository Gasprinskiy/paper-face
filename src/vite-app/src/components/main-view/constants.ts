import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface';
import { ActionMode, SubjectType } from './types';

export const ActionNames: Record<ActionMode, string> = {
  [ActionMode.NAMES]: 'Редактировать/добавить учеников',
  [ActionMode.SUBJECTS]: 'Редактировать/добавить предметы',
};

export const SubjectTypeNames: Record<SubjectType, string> = {
  [SubjectType.TEST]: 'Контрольная работа',
  [SubjectType.DEFAULT]: 'Классная работа"',
};

export const DropDownOptions: DropdownMixedOption[] = [
  {
    label: ActionNames[ActionMode.NAMES],
    key: ActionMode.NAMES,
  },
  {
    label: ActionNames[ActionMode.SUBJECTS],
    key: ActionMode.SUBJECTS,
  },
];
