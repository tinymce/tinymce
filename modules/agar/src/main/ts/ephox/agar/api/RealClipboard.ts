import { PlatformDetection } from '@ephox/sand';

import { KeyModifiers } from '../keyboard/FakeKeys';
import { RealKeys } from './RealKeys';
import { Step } from './Step';

const platform = PlatformDetection.detect();

const pCopy = (selector: string): Promise<{}> => {
  const modifiers: KeyModifiers = platform.os.isMacOS() ? { metaKey: true } : { ctrlKey: true };
  return RealKeys.pSendKeysOn(selector, [
    RealKeys.combo(modifiers, 'c')
  ]);
};

const sCopy = <T>(selector: string): Step<T, T> =>
  Step.fromPromise<T>(() => pCopy(selector));

const pPaste = (selector: string): Promise<{}> => {
  const modifiers: KeyModifiers = platform.os.isMacOS() ? { metaKey: true } : { ctrlKey: true };
  return RealKeys.pSendKeysOn(selector, [
    RealKeys.combo(modifiers, 'v')
  ]);
};

const sPaste = <T>(selector: string): Step<T, T> =>
  Step.fromPromise(() => pPaste(selector));

export {
  pCopy,
  pPaste,
  sCopy,
  sPaste
};
