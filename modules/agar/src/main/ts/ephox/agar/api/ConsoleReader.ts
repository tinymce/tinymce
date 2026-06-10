import { Arr, Global } from '@ephox/katamari';

export interface ConsoleReader {
  readonly logMessages: string[];
  readonly warnMessages: string[];
  readonly errorMessages: string[];
  readonly reset: () => void;
  readonly before: () => void;
  readonly after: () => void;
}

const setup = (): ConsoleReader => {
  let logMessages: string[] = [];
  let warnMessages: string[] = [];
  let errorMessages: string[] = [];
  let oldLog: typeof console['log'];
  let oldWarn: typeof console['warn'];
  let oldError: typeof console['error'];

  const reset = () => {
    logMessages = [];
    warnMessages = [];
    errorMessages = [];
  };

  const before = () => {
    reset();
    oldLog = Global.console.log;
    oldWarn = Global.console.warn;
    oldError = Global.console.error;
    Global.console.log = (...args: any[]) => {
      logMessages.push(Arr.map(args, (arg) => String(arg)).join(' '));
      oldLog.apply(console, args);
    };
    Global.console.warn = (...args: any[]) => {
      warnMessages.push(Arr.map(args, (arg) => String(arg)).join(' '));
      oldWarn.apply(console, args);
    };
    Global.console.error = (...args: any[]) => {
      errorMessages.push(Arr.map(args, (arg) => String(arg)).join(' '));
      oldError.apply(console, args);
    };
  };

  const after = () => {
    reset();
    Global.console.log = oldLog;
    Global.console.warn = oldWarn;
    Global.console.error = oldError;
  };

  return {
    get logMessages() {
      return logMessages;
    },
    get warnMessages() {
      return warnMessages;
    },
    get errorMessages() {
      return errorMessages;
    },
    reset,
    before,
    after
  };
};

export {
  setup
};
