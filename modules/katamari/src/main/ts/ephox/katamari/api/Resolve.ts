import { Global } from './Global';

/** path :: ([String], JsObj?) -> JsObj */
export const path = function <T> (parts: string[], scope?: {}): T | undefined {
  let o = scope !== undefined && scope !== null ? scope : Global;
  for (let i = 0; i < parts.length && o !== undefined && o !== null; ++i) {
    o = o[parts[i]];
  }
  return o;
};

/** resolve :: (String, JsObj?) -> JsObj */
export const resolve = function <T> (p: string, scope?: {}): T | undefined {
  const parts = p.split('.');
  return path(parts, scope);
};

/** step :: (JsObj, String) -> JsObj */
export const step = function <T extends Record<string, any>> (o: {}, part: string): T {
  if (o[part] === undefined || o[part] === null) {
    o[part] = {};
  }
  return o[part];
};

/** forge :: ([String], JsObj?) -> JsObj */
export const forge = function <T extends string[]> (parts: T, target?: {}): {[ K in T[number]]: {}} {
  let o = target !== undefined ? target : Global;
  for (let i = 0; i < parts.length; ++i) {
    o = step(o, parts[i]);
  }
  return o;
};

/** namespace :: (String, JsObj?) -> JsObj */
export const namespace = function (name: string, target?: {}): { [key: string]: {} } {
  const parts = name.split('.');
  return forge(parts, target);
};
