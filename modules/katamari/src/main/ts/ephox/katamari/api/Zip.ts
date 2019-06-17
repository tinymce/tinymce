/** Creates an object from parallel arrays of key/value pairs.
 *  If keys is longer than values, undefined is used as the values for these keys.
 *  If values is longer than keys, extra values are ignored.
 *  zipToObject :: ([key], [value]) -> {key1: value1, key2: value2 ...}
 */
export const zipToObject = function <V>(keys: string[] | number[], values: V[]) {
  const r: Record<string, V | undefined> = {};
  for (let i = 0; i < keys.length; i++) {
    r[keys[i]] = values[i];
  }
  return r;
};

/** zipToTuples :: ([key], [value]) -> [{k: key1, v: value1}, {k: key2, v: value2} ...] */
export const zipToTuples = function <K, V>(keys: K[], values: V[]) {
  const r: { k: K, v: V | undefined }[] = [];
  for (let i = 0; i < keys.length; i++) {
    r.push({ k: keys[i], v: values[i] });
  }
  return r;
};
