import { useMagicKeys } from '@vueuse/core';
import { watchEffect } from 'vue';
import { useSubjectsListStorage } from '../storage';
import { LangCode } from '@/shared/types';

const hotKetsMap: Record<string, () => void> = {
  'control-shift-s': setSubjectsDefaultLangCode,
};

function setSubjectsDefaultLangCode() {
  const subjectList = useSubjectsListStorage();
  subjectList.value = subjectList.value.map((subject) => {
    subject.lang_code = LangCode.RU;
    return subject;
  });
}

export function useHotKeys() {
  const { current } = useMagicKeys({
    reactive: true,
  });

  watchEffect(() => {
    const key = Array.from(current).join('-');
    hotKetsMap[key]?.();
  });
}
