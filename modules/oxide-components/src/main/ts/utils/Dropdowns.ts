import { Arr } from '@ephox/katamari';

// TODO: move to Sugar TINY-13426
export const hideDropdowns = (scope: HTMLElement): void => {
  Arr.each(scope.querySelectorAll<HTMLElement>('.tox-dropdown-content:popover-open'), (el) => el.hidePopover());
};