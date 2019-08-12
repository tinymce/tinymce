/** Creates an object from parallel arrays of key/value pairs.
 *  Keys and values must be the same length or a error is thrown.
 *  zipToObject :: ([key], [value]) -> {key1: value1, key2: value2 ...}
 */
export const zipToObject = function <V>(keys: string[] | number[], values: V[]) {
  if (keys.length !== values.length) {
    throw new Error(`Assertion failed: keys.length !== values.length (${keys.length} !== ${values.length})`);
  }
  const r: Record<string, V> = {};
  for (let i = 0; i < keys.length; i++) {
    r[keys[i]] = values[i];
  }
  return r;
};

/** zipToTuples :: ([key], [value]) -> [{k: key1, v: value1}, {k: key2, v: value2} ...] */
export const zipToTuples = function <K, V>(keys: K[], values: V[]) {
  if (keys.length !== values.length) {
    throw new Error(`Assertion failed: keys.length !== values.length (${keys.length} !== ${values.length})`);
  }
  const r: { k: K, v: V }[] = [];
  for (let i = 0; i < keys.length; i++) {
    r.push({ k: keys[i], v: values[i] });
  }
  return r;
};
