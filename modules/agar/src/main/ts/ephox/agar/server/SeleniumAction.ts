import { DataType, Http } from '@ephox/jax';

import { Chain } from '../api/Chain';
import { Step } from '../api/Step';

const postInfo = (path: string, info: any, die: (err: any) => void, next: (v: {}) => void): void => {
  Http.post({
    url: path,
    body: {
      type: DataType.JSON,
      data: info
    },
    responseType: DataType.JSON
  }).get((res) => {
    res.fold((e) => die(JSON.stringify(e)), next);
  });
};

const sPerform = <T> (path: string, info: any): Step<T, T> =>
  Step.async<T>((next, die) => {
    postInfo(path, info, die, next);
  });

const cPerform = <T> (path: string): Chain<T, T> =>
  Chain.async((info, next, die) => {
    postInfo(path, info, die, next);
  });

const pPerform = (path: string, info: any): Promise<{}> => {
  return new Promise(((resolve, reject) => {
    postInfo(path, info, reject, resolve);
  }));
};

export {
  sPerform,
  cPerform,
  pPerform
};
