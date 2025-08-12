import { useStorage } from '@vueuse/core';
import type { RemovableRef } from '@vueuse/core';

export function useArrayStorage<T>(key: string, value: Array<T>): RemovableRef<Array<T>> {
  return useStorage<Array<T>>(key, value, undefined, {
    serializer: {
      read: (v: string) => v ? JSON.parse(v) : [],
      write: (v: Array<T>) => JSON.stringify(v),
    },
  });
}
