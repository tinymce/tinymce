import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';

var dismiss = function (gui, element) {
  gui.broadcastOn([
    'dismiss.popups'
  ], {
    target: element
  });
};


var sDismiss = function (label, gui, element) {
  return Logger.t(
    'Broadcast dimiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(function () {
        dismiss(gui, element);
      })
    ])
  );
};

var sDismissOn = function (label, gui, selector) {
  return Logger.t(
    'Broadcast dimiss: ' + label,
    GeneralSteps.sequence([
      Step.sync(function () {
        var item = UiFinder.findIn(gui.element(), selector).getOrDie(
          new Error('Could not find the item (' + selector + ') for dispatching dismiss')
        );

        dismiss(gui, item);
      })
    ])
  );
};

export default <any> {
  sDismissOn: sDismissOn,
  sDismiss: sDismiss
};