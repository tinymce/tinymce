import { Step } from "./Step";
import { NextFn, DieFn } from "../pipe/Pipe";
import * as ErrorTypes from '../alien/ErrorTypes';
import { Arr, Fun } from '@ephox/katamari';
import { Chain, Wrap } from "./Chain";
import { GeneralSteps } from "./Main";
import { console } from "@ephox/dom-globals";

const generateLogMsg = (qaId: string, description: string) => {
  // Format: 'TestCase-<plugin name>-<test case ID / TBA>-<description of the test>'
  return `TestCase-${qaId}-${description}`;
};

const enrichErrorMsg = (label, err) => {
  return ErrorTypes.enrichWith(label, err);
};

const logStep = <T, U>(label: string, f: Step<T, U>): Step<T, U> => {
  return (value: T, next: NextFn<U>, die: DieFn) => {
    const dieWith: DieFn = Fun.compose(die, Fun.curry(enrichErrorMsg, label));
    try {
      return f(value, next, dieWith);
    } catch (err) {
      dieWith(err);
    }
  };
};

const logStepsWithLineNum = <T, U>(label: string, fs: Step<T, U>[]): Step<T, U> => {
  if (fs.length === 0) return GeneralSteps.sequence(fs);
  return GeneralSteps.sequence(Arr.map(fs, (f: Step<T, U>, i: number) => {
    return logStep(label + '(' + i + ')', f);
  }));
};

const logChain = <T, U>(label: string, c: Chain<T, U>): Chain<T, U>  => {
  const trial = (f: (value: Wrap<T>, next: NextFn<Wrap<U>>, die: DieFn) => void): Chain<T, U> => {
    return {
      runChain: (value: Wrap<T>, next: NextFn<Wrap<U>>, die: DieFn) => {
        const dieWith: DieFn = Fun.compose(die, Fun.curry(enrichErrorMsg, label));
        try {
          return f(value, next, dieWith);
        } catch (err) {
          dieWith(err);
        }
      }
    };
  };

  return trial(c.runChain);
};

const logChains = <T, U>(label: string, fs: Chain<T, U>[]) => {
  if (fs.length === 0) return fs;
  return Arr.map(fs, (f: Chain<T, U>, i: number) => {
    return logChain(label + '(' + i + ')', f);
  });
};

const log = (qaId: string, description: string, xs: any[]) => {
  const label = generateLogMsg(qaId, description);
  // TODO: call relevant function with label
};

export default {
  log,
  logStep,
  logChain
}