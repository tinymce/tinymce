import * as Generators from './Generators';
import * as ArbContent from '../arbitrary/ArbContent';
import { Fun } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

const scenario = (component, overrides, exclusions) => {
  // Note, in some environments, scenarios will not work, if setting
  // the arbitrary html involves some normalisation.
  const arbitrary = content(component, overrides);
  const generator = arbitrary.generator.flatMap((root) =>
    Generators.selection(root, exclusions).map((selection) => ({
      root: Fun.constant(root),
      selection: Fun.constant(selection)
    })));

  return Jsc.bless({
    generator
  });
};

const content = (component, overrides?) =>
  ArbContent.arbOf(component, overrides);

export {
  scenario,
  content
};
