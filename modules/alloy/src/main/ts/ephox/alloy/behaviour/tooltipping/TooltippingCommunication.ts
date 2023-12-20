import { Id } from '@ephox/katamari';

const ExclusivityChannel = Id.generate('tooltip.exclusive');

const ShowTooltipEvent = Id.generate('tooltip.show');
const HideTooltipEvent = Id.generate('tooltip.hide');
const ImmediateHideTooltipEvent = Id.generate('tooltip.immediateHide');
const ImmediateShowTooltipEvent = Id.generate('tooltip.immediateShow');

export {
  ExclusivityChannel,
  ShowTooltipEvent,
  HideTooltipEvent,
  ImmediateShowTooltipEvent,
  ImmediateHideTooltipEvent
};
