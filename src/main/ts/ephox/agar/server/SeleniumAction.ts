import { Ajax, ContentType, Credentials, ResponseType } from '@ephox/jax';

import { Step } from '../api/Step';

const sPerform = function <T>(path: string, info: any) {
  return Step.async<T>(function (next, die) {
    Ajax.post(
      path,
      ContentType.json(info),
      ResponseType.json(),
      Credentials.none(),
      {}
    ).get(function (res) {
      res.fold(die, function () {
        next();
      });
    });
  });
};

export {
  sPerform
};