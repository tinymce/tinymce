import { Arr } from '@ephox/katamari';

import { Chain } from './Chain';
import { sequence } from './GeneralSteps';
import { Step } from './Step';

const generateLogMsg = (testId: string, description: string): string =>
  // AP-147 Format: 'TestCase-<plugin name>-<test case ID / TBA:> <description of the test>'
  `TestCase-${testId}: ${description}`;

const step = <T, U>(testId: string, description: string, f: Step<T, U>): Step<T, U> => Step.label(generateLogMsg(testId, description), f);

const steps = (testId: string, description: string, fs: Step<any, any>[]): Step<any, any>[] => Arr.map(fs, (f, i) => step(testId, description + ' (' + i + ')', f));

const stepsAsStep = (testId: string, description: string, fs: Step<any, any>[]): Step<any, any> => sequence(steps(testId, description, fs));

const chain = <T, U>(testId: string, description: string, c: Chain<T, U>): Chain<T, U> => Chain.label(generateLogMsg(testId, description), c);

const chains = (testId: string, description: string, cs: Chain<any, any>[]): Chain<any, any>[] => Arr.map(cs, (c, i) => chain(testId, description + ' (' + i + ')', c));

const chainsAsChain = (testId: string, description: string, cs: Chain<any, any>[]): Chain<any, any> => Chain.fromChains(chains(testId, description, cs));

const chainsAsStep = (testId: string, description: string, cs: Chain<any, any>[]): Step<any, any> => Chain.asStep({}, chains(testId, description, cs));

export {
  step,
  steps,
  stepsAsStep,
  chain,
  chains,
  chainsAsChain,
  chainsAsStep
};
