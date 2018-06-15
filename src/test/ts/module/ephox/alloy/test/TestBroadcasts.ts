import { GeneralSteps, Logger, Step, UiFinder } from '@ephox/agar';

const dismiss = (gui, element) => {
  gui.broadcastOn([
    'dismiss.popups'
  ], {
    target: element
  });
};

const sDismiss = (label, gui, element) => {
  return Logger.t(
    'Broadcast dimiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(() => {
        dismiss(gui, element);
      })
    ])
  );
};

const sDismissOn = (label, gui, selector) => {
  return Logger.t(
    'Broadcast dimiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(() => {
        const item = UiFinder.findIn(gui.element(), selector).getOrDie(
          new Error('Could not find the item (' + selector + ') for dispatching dismiss')
        );

        dismiss(gui, item);
      })
    ])
  );
};

export default <any> {
  sDismissOn,
  sDismiss
};