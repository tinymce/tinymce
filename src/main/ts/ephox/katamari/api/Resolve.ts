import { Global } from './Global';

/** path :: ([String], JsObj?) -> JsObj */
export const path = function (parts: string[], scope?: {}) {
  let o = scope !== undefined && scope !== null ? scope : Global;
  for (let i = 0; i < parts.length && o !== undefined && o !== null; ++i)
    o = o[parts[i]];
  return o;
};

/** resolve :: (String, JsObj?) -> JsObj */
export const resolve = function (p: string, scope?: {}) {
  const parts = p.split('.');
  return path(parts, scope);
};

/** step :: (JsObj, String) -> JsObj */
export const step = function (o: {}, part: string) {
  if (o[part] === undefined || o[part] === null)
    o[part] = {};
  return o[part];
};

/** forge :: ([String], JsObj?) -> JsObj */
export const forge = function (parts: string[], target?: {}) {
  let o = target !== undefined ? target : Global;
  for (let i = 0; i < parts.length; ++i)
    o = step(o, parts[i]);
  return o;
};

/** namespace :: (String, JsObj?) -> JsObj */
export const namespace = function (name: string, target?: {}) {
  const parts = name.split('.');
  return forge(parts, target);
};
