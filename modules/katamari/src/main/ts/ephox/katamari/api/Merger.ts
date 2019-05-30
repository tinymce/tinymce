import * as Type from './Type';

type MergeStrategy = (old: any, nu: any) => any;

const hasOwnProperty = Object.prototype.hasOwnProperty;

const shallow = function (old: any, nu: any) {
  return nu;
};

const deep = function (old: any, nu: any) {
  const bothObjects = Type.isObject(old) && Type.isObject(nu);
  return bothObjects ? deepMerge(old, nu) : nu;
};

const baseMerge = function (merger: MergeStrategy): (...objs: {}[]) => any {
  return function() {
    // Don't use array slice(arguments), makes the whole function unoptimisable on Chrome
    const objects = new Array(arguments.length);
    for (let i = 0; i < objects.length; i++) objects[i] = arguments[i];

    if (objects.length === 0) throw new Error('Can\'t merge zero objects');

    const ret = {};
    for (let j = 0; j < objects.length; j++) {
      const curObject = objects[j];
      for (const key in curObject) if (hasOwnProperty.call(curObject, key)) {
        ret[key] = merger(ret[key], curObject[key]);
      }
    }
    return ret;
  };
};

export const deepMerge = baseMerge(deep);
export const merge = baseMerge(shallow);
