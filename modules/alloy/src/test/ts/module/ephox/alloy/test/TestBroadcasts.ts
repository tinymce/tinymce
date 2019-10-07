import { GeneralSteps, Logger, Step, UiFinder } from '@ephox/agar';

const dismiss = (gui, element) => {
  gui.broadcastOn([
    'dismiss.popups'
  ], {
    target: element
  });
};

const reposition = (gui) => {
  gui.broadcastOn([
    'reposition.popups'
  ], { });
};

const sDismiss = (label, gui, element) => {
  return Logger.t(
    'Broadcast dismiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(() => {
        dismiss(gui, element);
      })
    ])
  );
};

const sDismissOn = (label, gui, selector) => {
  return Logger.t(
    'Broadcast dismiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(() => {
        const item = UiFinder.findIn(gui.element(), selector).getOrDie();

        dismiss(gui, item);
      })
    ])
  );
};

const sReposition = (label, gui) => {
  return Logger.t(
    'Broadcast reposition: ' + label,
    GeneralSteps.sequence([
      Step.sync(() => {
        reposition(gui);
      })
    ])
  );
};

export {
  sDismissOn,
  sDismiss,
  sReposition
};
