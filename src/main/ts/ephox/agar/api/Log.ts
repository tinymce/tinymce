import { Step } from "./Step";
import { NextFn, DieFn } from "../pipe/Pipe";
import * as ErrorTypes from '../alien/ErrorTypes';
import { Arr, Fun } from '@ephox/katamari';
import { Chain, Wrap } from "./Chain";
import { GeneralSteps } from "./Main";
import { console } from "@ephox/dom-globals";

const generateLogMsg = (qaId: string, description: string) => {
  // AP-147 Format: 'TestCase-<plugin name>-<test case ID / TBA>-<description of the test>'
  return `TestCase-${qaId}-${description}`;
};

const enrichErrorMsg = (label, err) => {
  return ErrorTypes.enrichWith(label, err);
};

const enrichDie = (label, f) => {
  return (value, next, die: DieFn) => {
    const dieWith: DieFn = Fun.compose(die, Fun.curry(enrichErrorMsg, label));
    try {
      return f(value, next, dieWith);
    } catch (err) {
      dieWith(err);
    }
  };
};

const step = <T, U>(qaId: string, description: string, f: Step<T, U>): Step<T, U> => {
  const label = generateLogMsg(qaId, description);
  return enrichDie(label, f);
};

const steps = <T, U>(qaId: string, description: string, fs: Step<T, U>[]): Step<T, U>[] => {
  if (fs.length === 0) return fs;
  return Arr.map(fs, (f: Step<T, U>, i: number) => {
    return step(qaId, description +  + ' (' + i + ')', f);
  });
};

const stepsAsStep = <T, U>(qaId: string, description: string, fs: Step<T, U>[]): Step<T, U> => {
  return GeneralSteps.sequence(steps(qaId, description, fs));
};

const chain = <T, U>(qaId: string, description: string, c: Chain<T, U>): Chain<T, U>  => {
  const label = generateLogMsg(qaId, description);
  const switchDie = (f: (value: Wrap<T>, next: NextFn<Wrap<U>>, die: DieFn) => void): Chain<T, U> => {
    return { runChain: enrichDie(label, f) };
  };
  return switchDie(c.runChain);
};

const chains = <T, U>(qaId: string, description: string, fs: Chain<T, U>[]): Chain<T, U>[] => {
  if (fs.length === 0) return fs;
  return Arr.map(fs, (f: Chain<T, U>, i: number) => {
    return chain(qaId, description + ' (' + i + ')', f);
  });
};

const chainsAsChain = <T, U>(qaId: string, description: string, fs: Chain<T, U>[]): Chain<T, U> => {
  return Chain.fromChains(chains(qaId, description, fs));
};

export default {
  step,
  steps,
  stepsAsStep,
  chain,
  chains,
  chainsAsChain
}