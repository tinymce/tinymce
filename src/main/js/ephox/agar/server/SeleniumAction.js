import Step from '../api/Step';
import { Ajax } from '@ephox/jax';
import { ContentType } from '@ephox/jax';
import { Credentials } from '@ephox/jax';
import { ResponseType } from '@ephox/jax';

var sPerform = function (path, info) {
  return Step.async(function (next, die) {
    Ajax.post(
      path,
      ContentType.json(info),
      ResponseType.json(),
      Credentials.none(),
      { }
    ).get(function (res) {
      res.fold(die, function () {
        next();
      });
    });
  });
};

export default <any> {
  sPerform: sPerform
};