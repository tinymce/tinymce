import { Cell } from '@ephox/katamari';

import { ScrollInfo } from '../core/Actions';

export interface Api {
  readonly isFullscreen: () => boolean;
}

const get = (fullscreenState: Cell<ScrollInfo | null>): Api => ({
  isFullscreen: () => fullscreenState.get() !== null
});

export {
  get
};
