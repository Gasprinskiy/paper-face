import type { NameOption, SubjectOption } from '@/shared/types';
import { useArrayStorage } from './proxy';

export const useNamesListStorage = () => useArrayStorage<NameOption>('name_list', []);
export const useSubjectsListStorage = () => useArrayStorage<SubjectOption>('subjects_list', []);
