import { PlatformDetection } from '@ephox/sand';

import { KeyModifiers } from '../keyboard/FakeKeys';
import * as SeleniumAction from '../server/SeleniumAction';
import { RealKeys } from './RealKeys';
import { Step } from './Step';

const platform = PlatformDetection.detect();

const pImportToClipboard = (filename: string): Promise<{}> =>
  SeleniumAction.pPerform('/clipboard', {
    import: filename
  });

const sImportToClipboard = <T>(filename: string): Step<T, T> =>
  Step.fromPromise(() => pImportToClipboard(filename));

const pCopy = (selector: string): Promise<{}> => {
  const modifiers: KeyModifiers = platform.os.isOSX() ? { metaKey: true } : { ctrlKey: true };
  return RealKeys.pSendKeysOn(selector, [
    RealKeys.combo(modifiers, 'c')
  ]);
};

const sCopy = <T>(selector: string): Step<T, T> =>
  Step.fromPromise<T>(() => pCopy(selector));

const pPaste = (selector: string): Promise<{}> => {
  const modifiers: KeyModifiers = platform.os.isOSX() ? { metaKey: true } : { ctrlKey: true };
  return RealKeys.pSendKeysOn(selector, [
    RealKeys.combo(modifiers, 'v')
  ]);
};

const sPaste = <T>(selector: string): Step<T, T> =>
  Step.fromPromise(() => pPaste(selector));

export {
  pImportToClipboard,
  pCopy,
  pPaste,
  sImportToClipboard,
  sCopy,
  sPaste
};
