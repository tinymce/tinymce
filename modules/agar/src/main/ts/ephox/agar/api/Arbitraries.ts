import Jsc from '@ephox/wrap-jsverify';
import * as ArbContent from '../arbitrary/ArbContent';
import * as Generators from './Generators';

const scenario = (component, overrides, exclusions) => {
  // Note, in some environments, scenarios will not work, if setting
  // the arbitrary html involves some normalisation.
  const arbitrary = content(component, overrides);
  const generator = arbitrary.generator.flatMap((root) =>
    Generators.selection(root, exclusions).map((selection) => ({
      root,
      selection
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
