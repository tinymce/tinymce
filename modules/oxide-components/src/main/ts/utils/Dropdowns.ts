export const hideAll = (): void => {
  document.querySelectorAll('.tox-dropdown-content:popover-open').forEach((popover) => {
    (popover as HTMLElement).hidePopover();
  });
};