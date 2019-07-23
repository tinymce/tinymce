import Promise from './util/Promise';
import ScriptLoader from './dom/ScriptLoader';
import { setTimeout, clearTimeout } from '@ephox/dom-globals';

interface Scripts {
  load(id: string, url: string): Promise<any>;
  add(id: string, data: any): void;
}

const awaiter = (resolveCb: (data: any) => void, rejectCb: (err?: any) => void, timeout = 1000) => {
  let done = false;
  let timer = null;
  const complete = <T extends any[]>(completer: (...args: T) => void) => (...args: T) => {
    if (!done) {
      done = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      completer.apply(null, args);
    }
  };
  const resolve = complete(resolveCb);
  const reject = complete(rejectCb);
  const start = (...args: Parameters<typeof reject>) => {
    if (!done && timer === null) {
      timer = setTimeout(() => reject.apply(null, args), timeout);
    }
  };
  return {
    start,
    resolve,
    reject
  };
};

const create = (): Scripts => {
  const tasks: Record<string, Promise<any>> = {};
  const resultFns: Record<string, (data: any) => void> = {};

  const load = (id: string, url: string): Promise<any> => {
    const loadErrMsg = `Script at URL ${url} failed to load`;
    const runErrMsg = `Script at URL ${url} did not call \`tinymce.Scripts.add('${id}', data)\` within 1 second`;
    if (tasks[id] !== undefined) {
      return tasks[id];
    } else {
      const task = new Promise<any>((resolve, reject) => {
        const waiter = awaiter(resolve, reject);
        resultFns[id] = waiter.resolve;
        ScriptLoader.ScriptLoader.loadScript(url, () => waiter.start(runErrMsg), () => waiter.reject(loadErrMsg));
      });
      tasks[id] = task;
      return task;
    }
  };

  const add = (id: string, data: any) => {
    if (resultFns[id] !== undefined) {
      resultFns[id](data);
      delete resultFns[id];
    }
    tasks[id] = Promise.resolve(data);
  };

  return {
    load,
    add
  };
};

const Scripts = create();

export default Scripts;