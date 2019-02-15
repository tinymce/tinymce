import { Option } from '@ephox/katamari';
import { PRegExp } from './Types';

// tslint:disable-next-line:variable-name
export const Custom = function (regex: string, prefix: PRegExp['prefix'], suffix: PRegExp['suffix'], flags: Option<string>): PRegExp {
  const term = function () {
    return new RegExp(regex, flags.getOr('g'));
  };

  return {
    term,
    prefix,
    suffix
  };
};