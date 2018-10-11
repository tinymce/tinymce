import { Arr, Fun } from '@ephox/katamari';
import * as ErrorTypes from '../alien/ErrorTypes';
import { DieFn, NextFn, AgarLogs } from "../pipe/Pipe";
import { Chain, Wrap } from "./Chain";
import { GeneralSteps } from "./Main";
import { Step } from "./Step";

const generateLogMsg = (testId: string, description: string) => {
  // AP-147 Format: 'TestCase-<plugin name>-<test case ID / TBA:> <description of the test>'
  return `TestCase-${testId}: ${description}`;
};

const enrichErrorMsg = (label, err) => {
  return ErrorTypes.enrichWith(label, err);
};

const enrichDie = (label, f) => {
  return (value, next, die: DieFn, logs: AgarLogs) => {
    // TODO: Change this to use logs instead.
    const dieWith: DieFn = Fun.compose(die, Fun.curry(enrichErrorMsg, label));
    try {
      return f(value, next, dieWith, logs);
    } catch (err) {
      dieWith(err, logs);
    }
  };
};

const step = <T, U>(testId: string, description: string, f: Step<T, U>): Step<T, U> => {
  const label = generateLogMsg(testId, description);
  return enrichDie(label, f);
};

const steps = <T, U>(testId: string, description: string, fs: Step<T, U>[]): Step<T, U>[] => {
  if (fs.length === 0) return fs;
  return Arr.map(fs, (f: Step<T, U>, i: number) => {
    return step(testId, description + ' (' + i + ')', f);
  });
};

const stepsAsStep = <T, U>(testId: string, description: string, fs: Step<T, U>[]): Step<T, U> => {
  return GeneralSteps.sequence(steps(testId, description, fs));
};

const chain = <T, U>(testId: string, description: string, c: Chain<T, U>): Chain<T, U>  => {
  const label = generateLogMsg(testId, description);
  const switchDie = (f: (value: Wrap<T>, next: NextFn<Wrap<U>>, die: DieFn, logs: AgarLogs) => void): Chain<T, U> => {
    return { runChain: enrichDie(label, f) };
  };
  return switchDie(c.runChain);
};

const chains = <T, U>(testId: string, description: string, fs: Chain<T, U>[]): Chain<T, U>[] => {
  if (fs.length === 0) return fs;
  return Arr.map(fs, (f: Chain<T, U>, i: number) => {
    return chain(testId, description + ' (' + i + ')', f);
  });
};

const chainsAsChain = <T, U>(testId: string, description: string, fs: Chain<T, U>[]): Chain<T, U> => {
  return Chain.fromChains(chains(testId, description, fs));
};

const chainsAsStep = <T>(testId: string, description: string, fs: Chain<any,any>[]): Step<T,T> => {
  return Chain.asStep({} as T, chains(testId, description, fs));
};

export {
  step,
  steps,
  stepsAsStep,
  chain,
  chains,
  chainsAsChain,
  chainsAsStep,
};
