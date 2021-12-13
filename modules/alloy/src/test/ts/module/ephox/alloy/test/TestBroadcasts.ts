import { GeneralSteps, Logger, Step, UiFinder } from '@ephox/agar';
import { SugarElement } from '@ephox/sugar';

import { GuiSystem } from 'ephox/alloy/api/system/Gui';

const dismiss = (gui: GuiSystem, element: SugarElement<Element>): void => {
  gui.broadcastOn([
    'dismiss.popups'
  ], {
    target: element
  });
};

const reposition = (gui: GuiSystem): void => {
  gui.broadcastOn([
    'reposition.popups'
  ], { });
};

const sDismiss = <T>(label: string, gui: GuiSystem, element: SugarElement<Element>): Step<T, T> =>
  Logger.t(
    'Broadcast dismiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(() => {
        dismiss(gui, element);
      })
    ])
  );

const sDismissOn = <T>(label: string, gui: GuiSystem, selector: string): Step<T, T> =>
  Logger.t(
    'Broadcast dismiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(() => {
        const item = UiFinder.findIn(gui.element, selector).getOrDie();

        dismiss(gui, item);
      })
    ])
  );

const sReposition = <T>(label: string, gui: GuiSystem): Step<T, T> =>
  Logger.t(
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
