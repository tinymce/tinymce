import { Arr } from '@ephox/katamari';

import * as ErrorTypes from '../alien/ErrorTypes';
import { DieFn, NextFn } from '../pipe/Pipe';
import { Chain, Wrap } from './Chain';
import { GeneralSteps } from './Main';
import { Step } from './Step';
import { addLogEntry, popLogLevel, pushLogLevel, TestLogs } from './TestLogs';

const generateLogMsg = (testId: string, description: string) => {
  // AP-147 Format: 'TestCase-<plugin name>-<test case ID / TBA:> <description of the test>'
  return `TestCase-${testId}: ${description}`;
};

const enrichErrorMsg = (label, err) => {
  return ErrorTypes.enrichWith(label, err);
};

const enrichDie = (label, f) => {
  return (value, next, die: DieFn, logs: TestLogs) => {
    const updatedLogs = pushLogLevel(addLogEntry(logs, label));
    const dieWith: DieFn = (err, newLogs) => die(enrichErrorMsg(label, err), popLogLevel(newLogs));
    try {
      return f(value, (v, newLogs) => next(v, popLogLevel(newLogs)), dieWith, updatedLogs);
    } catch (err) {
      dieWith(err, updatedLogs);
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
  const switchDie = (f: (value: Wrap<T>, next: NextFn<Wrap<U>>, die: DieFn, logs: TestLogs) => void): Chain<T, U> => {
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
