// type Primitive = null | undefined | string | number | boolean | symbol | bigint;

export function deepClone<T>(value: T): T {
  const seen = new WeakMap<object, any>();

  function _clone<V>(v: V): V {
    // primitives
    if (v === null || typeof v !== 'object') {
      return v;
    }

    // already seen (circular)
    if (seen.has(v as unknown as object)) {
      return seen.get(v as unknown as object);
    }

    // Date
    if (v instanceof Date) {
      return new Date(v.getTime()) as unknown as V;
    }

    // RegExp
    if (v instanceof RegExp) {
      const re = new RegExp(v.source, v.flags);
      re.lastIndex = (v as RegExp).lastIndex;
      return re as unknown as V;
    }

    // ArrayBuffer
    if (v instanceof ArrayBuffer) {
      return v.slice(0) as unknown as V;
    }

    // TypedArray (Int8Array, Uint8Array, Float32Array, ...)
    if (ArrayBuffer.isView(v) && !(v instanceof DataView)) {
      const Ctor = (v as any).constructor;
      return new Ctor((v as any).buffer.slice(0)) as unknown as V;
    }

    // DataView
    if (v instanceof DataView) {
      const buf = v.buffer.slice(0);
      return new DataView(buf, v.byteOffset, v.byteLength) as unknown as V;
    }

    // Map
    if (v instanceof Map) {
      const m = new Map();
      seen.set(v as unknown as object, m);
      (v as Map<any, any>).forEach((val, key) => {
        m.set(_clone(key), _clone(val));
      });
      return m as unknown as V;
    }

    // Set
    if (v instanceof Set) {
      const s = new Set();
      seen.set(v as unknown as object, s);
      (v as Set<any>).forEach((val) => {
        s.add(_clone(val));
      });
      return s as unknown as V;
    }

    // Error objects
    if (v instanceof Error) {
      const err = Object.create(Object.getPrototypeOf(v));
      seen.set(v as unknown as object, err);
      const descriptors = Object.getOwnPropertyDescriptors(v);
      for (const key of Reflect.ownKeys(descriptors)) {
        const desc = descriptors[key as keyof typeof descriptors];
        if ('value' in desc) {
          desc.value = _clone(desc.value);
        }
        Object.defineProperty(err, key, desc as PropertyDescriptor);
      }
      return err as unknown as V;
    }

    // Plain object or class instance
    const proto = Object.getPrototypeOf(v);
    const out = Object.create(proto);
    seen.set(v as unknown as object, out);

    // Copy property descriptors (keeps getters/setters & non-enumerable)
    const descriptors = Object.getOwnPropertyDescriptors(v);
    for (const key of Reflect.ownKeys(descriptors)) {
      const desc = descriptors[key as keyof typeof descriptors] as PropertyDescriptor;
      if ('value' in desc) {
        // deep clone data property value
        desc.value = _clone(desc.value);
      }
      // accessor getters/setters are functions — kept as-is
      Object.defineProperty(out, key, desc);
    }

    return out as V;
  }

  return _clone(value);
}

export function invertRecord<K extends string | number | symbol, V extends string | number | symbol>(
  record: Record<K, V>,
): Record<V, K> {
  const inverted: Partial<Record<V, K>> = {};

  for (const [key, value] of Object.entries(record)) {
    inverted[value as V] = key as K;
  }

  return inverted as Record<V, K>;
}
