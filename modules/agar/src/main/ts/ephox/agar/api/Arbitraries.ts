import { SimRange, SugarElement } from '@ephox/sugar';
import * as fc from 'fast-check';

import * as ArbContent from '../arbitrary/ArbContent';
import { SchemaDetail } from '../arbitrary/ArbSchemaTypes';
import { SelectionExclusions } from '../arbitrary/GenSelection';
import * as Generators from './Generators';

const scenario = (
  component: string,
  overrides: Record<string, Partial<SchemaDetail>>,
  exclusions: SelectionExclusions
): fc.Arbitrary<{ root: SugarElement<Node>; selection: SimRange }> => {
  // Note, in some environments, scenarios will not work, if setting
  // the arbitrary html involves some normalisation.
  const arbitrary = content(component, overrides);
  return arbitrary.chain((root) =>
    Generators.selection(root, exclusions).map((selection) => ({
      root,
      selection
    }))
  );
};

const content = <T extends Node>(component: string, overrides?: Record<string, Partial<SchemaDetail>>): fc.Arbitrary<SugarElement<T>> =>
  ArbContent.arbOf<T>(component, overrides);

export {
  scenario,
  content
};
