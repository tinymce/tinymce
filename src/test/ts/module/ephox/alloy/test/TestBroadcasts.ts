import { GeneralSteps, Logger, Step, UiFinder } from '@ephox/agar';

const dismiss = function (gui, element) {
  gui.broadcastOn([
    'dismiss.popups'
  ], {
    target: element
  });
};

const sDismiss = function (label, gui, element) {
  return Logger.t(
    'Broadcast dimiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(function () {
        dismiss(gui, element);
      })
    ])
  );
};

const sDismissOn = function (label, gui, selector) {
  return Logger.t(
    'Broadcast dimiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(function () {
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