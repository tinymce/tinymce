import { Ajax, ContentType, Credentials, ResponseType } from '@ephox/jax';

import { Step } from '../api/Step';
import { Chain } from '../api/Chain';

const sPerform = function <T>(path: string, info: any) {
  return Step.async<T>(function (next, die) {
    Ajax.post(
      path,
      ContentType.json(info),
      ResponseType.json(),
      Credentials.none(),
      {}
    ).get(function (res) {
      res.fold(die, next);
    });
  });
};

const cPerform = (path: string) =>
  Chain.async((info, next, die) => {
    Ajax.post(
      path,
      ContentType.json(info),
      ResponseType.json(),
      Credentials.none(),
      {}
    ).get((res) => {
      res.fold(die, next);
    })
  });

export {
  sPerform,
  cPerform
};