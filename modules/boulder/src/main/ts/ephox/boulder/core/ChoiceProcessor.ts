import { Obj } from '@ephox/katamari';
import { missingBranch, missingKey } from './SchemaError';
import { Processor, Strength } from './ValueProcessor';

const chooseFrom = function (path: string[], strength: Strength, input: Record<string, any>, branches: Record<string, Processor>, ch: string) {
  const fields = Obj.get(branches, ch);
  return fields.fold(function () {
    return missingBranch(path, branches, ch);
  }, function (vp) {
    return vp.extract(path.concat([ 'branch: ' + ch ]), strength, input);
  });
};

// The purpose of choose is to have a key which picks which of the schemas to follow.
// The key will index into the object of schemas: branches
const choose = function (key: string, branches: Record<string, Processor>): Processor {
  const extract = function (path: string[], strength, input: Record<string, any>) {
    const choice = Obj.get(input, key);
    return choice.fold(function () {
      return missingKey(path, key);
    }, function (chosen) {
      return chooseFrom(path, strength, input, branches, chosen);
    });
  };

  const toString = function () {
    return 'chooseOn(' + key + '). Possible values: ' + Obj.keys(branches);
  };

  return {
    extract,
    toString
  };
};

export {
  choose
};
