import { Chain, UiFinder } from '@ephox/agar';
import { Result } from '@ephox/katamari';

const cCountNumber = (selector) => Chain.fromChains([
  UiFinder.cFindAllIn(selector),
  Chain.mapper((ts) => ts.length)
]);

const cExtractOnlyOne = (selector) => Chain.fromChains([
  UiFinder.cFindAllIn(selector),
  Chain.binder((ts) => ts.length === 1 ? Result.value(ts[0]) : Result.error('Did not find exactly 1 of ' +
    selector + '. Found: ' + ts.length))
]);

export {
  cCountNumber,
  cExtractOnlyOne
};