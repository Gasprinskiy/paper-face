// type Primitive = null | undefined | string | number | boolean | symbol | bigint;

export function invertRecord<K extends string | number | symbol, V extends string | number | symbol>(
  record: Record<K, V>,
): Record<V, K> {
  const inverted: Partial<Record<V, K>> = {};

  for (const [key, value] of Object.entries(record)) {
    inverted[value as V] = key as K;
  }

  return inverted as Record<V, K>;
}

export function deepCopyArrayOfObjects<T extends object>(arr: Array<T>): Array<T> {
  let result: Array<T> = [];

  for (const element of arr) {
    result = [...result, deepCopyObject(element)];
  }

  return result;
};

export function deepCopyObject<T extends object>(obj: T): T {
  const result = {} as T;
  for (const key in obj) {
    const value = obj[key];
    if (value !== null && typeof value === 'object') {
      result[key] = deepCopyObject(value);
      continue;
    }

    result[key] = value;
  }

  return result;
}
