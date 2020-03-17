import { GeneralSteps, Logger, Step, UiFinder } from '@ephox/agar';
import { Element } from '@ephox/sugar';

import { GuiSystem } from 'ephox/alloy/api/system/Gui';

const dismiss = (gui: GuiSystem, element: Element) => {
  gui.broadcastOn([
    'dismiss.popups'
  ], {
    target: element
  });
};

const reposition = (gui: GuiSystem) => {
  gui.broadcastOn([
    'reposition.popups'
  ], { });
};

const sDismiss = (label: string, gui: GuiSystem, element: Element) => Logger.t(
  'Broadcast dismiss: ' + label,
  GeneralSteps.sequence([
    Step.sync(() => {
      dismiss(gui, element);
    })
  ])
);

const sDismissOn = (label: string, gui: GuiSystem, selector: string) => Logger.t(
  'Broadcast dismiss: ' + label,
  GeneralSteps.sequence([
    Step.sync(() => {
      const item = UiFinder.findIn(gui.element(), selector).getOrDie();

      dismiss(gui, item);
    })
  ])
);

const sReposition = (label: string, gui: GuiSystem) => Logger.t(
  'Broadcast reposition: ' + label,
  GeneralSteps.sequence([
    Step.sync(() => {
      reposition(gui);
    })
  ])
);

export {
  sDismissOn,
  sDismiss,
  sReposition
};
