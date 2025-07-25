import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import type { FocusManager } from './FocusManagers';

export type KeyRuleHandler<C> = (comp: SugarElement<HTMLElement>, se: Event, config: C) => Optional<boolean>;

export enum FocusInsideModes {
  OnFocusMode = 'onFocus'
}

export interface GeneralKeyingConfig {
  focusManager: FocusManager;
  focusInside: FocusInsideModes;
}
