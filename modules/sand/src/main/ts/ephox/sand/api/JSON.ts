import Global from '../util/Global';

/*
 * IE8 and above per
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
 */
const json = function () {
  return Global.getOrDie('JSON') as typeof JSON;
};

const parse = function (text: string) {
  return json().parse(text);
};

const stringify = function (obj: any, replacer?: (key: string, value: any) => any, space?: string | number) {
  return json().stringify(obj, replacer, space);
};

export default {
  parse,
  stringify
};