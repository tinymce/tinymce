define(
  'ephox.alloy.test.TestBroadcasts',

  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'global!Error'
  ],

  function (GeneralSteps, Logger, Step, UiFinder, Error) {
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

    return {
      sDismissOn: sDismissOn,
      sDismiss: sDismiss
    };
  }
);