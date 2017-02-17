define(
  'ephox.alloy.test.typeahead.TestTypeaheadSteps',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Logger',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.sugar.api.Focus'
  ],

  function (Assertions, Chain, FocusTools, Logger, UiControls, UiFinder, Waiter, Focus) {
    return function (doc, gui, typeahead) {
      var sWaitForMenu = function (label) {
        return Logger.t(
          label, 
          Waiter.sTryUntil(
            'Waiting for menu to appear',
            UiFinder.sExists(gui.element(), '.test-typeahead-selected-menu'),
            100,
            4000
          )
        );
      };

      var sWaitForNoMenu = function (label) {
        return Logger.t(
          label,
          Waiter.sTryUntil(
            'Waiting for menu to go away',
            UiFinder.sNotExists(gui.element(),  '.test-typeahead-selected-menu'),
            100,
            1000
          )
        );
      };

      var sAssertFocusOnTypeahead = function (label) {
        return Logger.t(
          label,
          FocusTools.sTryOnSelector(
            'Focus should be on typeahead',
            doc,
            'input'
          )
        );
      };

      var sAssertValue = function (label, expected) {
        return Logger.t(
          label,
          Chain.asStep(typeahead.element(), [
            Chain.op(function (t) {
              Focus.focus(t);
            }),
            UiControls.cGetValue,
            Assertions.cAssertEq('Checking value of typeahead', expected)
          ])
        );
      };

      return {
        sWaitForMenu: sWaitForMenu,
        sWaitForNoMenu: sWaitForNoMenu,
        sAssertFocusOnTypeahead: sAssertFocusOnTypeahead,
        sAssertValue: sAssertValue
      };
    };
  }
);