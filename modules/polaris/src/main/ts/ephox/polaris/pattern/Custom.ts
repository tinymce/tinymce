import { Optional } from '@ephox/katamari';

import { PRegExp } from './Types';

// tslint:disable-next-line:variable-name
export const Custom = (regex: string, prefix: PRegExp['prefix'], suffix: PRegExp['suffix'], flags: Optional<string>): PRegExp => {
  const term = () => {
    return new RegExp(regex, flags.getOr('g'));
  };

  return {
    term,
    prefix,
    suffix
  };
};
