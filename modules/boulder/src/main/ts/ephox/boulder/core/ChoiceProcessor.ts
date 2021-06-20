import { Obj } from '@ephox/katamari';

import { missingBranch, missingKey } from './SchemaError';
import { StructureProcessor } from './StructureProcessor';

const chooseFrom = (path: string[], input: Record<string, any>, branches: Record<string, StructureProcessor>, ch: string) => {
  const fields = Obj.get(branches, ch);
  return fields.fold(
    () => missingBranch(path, branches, ch),
    (vp) => vp.extract(path.concat([ 'branch: ' + ch ]), input)
  );
};

// The purpose of choose is to have a key which picks which of the schemas to follow.
// The key will index into the object of schemas: branches
const choose = (key: string, branches: Record<string, StructureProcessor>): StructureProcessor => {
  const extract = (path: string[], input: Record<string, any>) => {
    const choice = Obj.get(input, key);
    return choice.fold(
      () => missingKey(path, key),
      (chosen) => chooseFrom(path, input, branches, chosen)
    );
  };

  const toString = () => 'chooseOn(' + key + '). Possible values: ' + Obj.keys(branches);

  return {
    extract,
    toString
  };
};

export {
  choose
};
