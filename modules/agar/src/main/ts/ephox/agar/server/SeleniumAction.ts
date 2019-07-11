import { Step } from '../api/Step';
import { Chain } from '../api/Chain';
import { Http, DataType } from '@ephox/jax';

const postInfo = (path: string, info: any, die: (err: any) => void, next: (v: {}) => void) => {
  Http.post({
    url: path,
    body: {
      type: DataType.JSON,
      data: info
    },
    responseType: DataType.JSON
  }).get((res) => {
    res.fold(die, next);
  });
};

const sPerform = <T>(path: string, info: any) =>
  Step.async<T>(function (next, die) {
    postInfo(path, info, die, next);
  });

const cPerform = (path: string) =>
  Chain.async((info, next, die) => {
    postInfo(path, info, die, next);
  });

export {
  sPerform,
  cPerform
};
