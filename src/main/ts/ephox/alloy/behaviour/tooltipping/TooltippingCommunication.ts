import { Id } from '@ephox/katamari';

const ExclusivityChannel = Id.generate('tooltip.exclusive');

const ShowTooltipEvent = Id.generate('tooltip.show');
const HideTooltipEvent = Id.generate('tooltip.hide');

export {
  ExclusivityChannel,
  ShowTooltipEvent,
  HideTooltipEvent
};