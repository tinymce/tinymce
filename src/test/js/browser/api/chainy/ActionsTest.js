asynctest(
  'ActionsTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Assertions',
    'ephox.mcagar.api.chainy.Api',
    'ephox.mcagar.api.chainy.Ui',
    'ephox.mcagar.api.chainy.Actions',
    'ephox.mcagar.api.chainy.Editor'
  ],

  function (Pipeline, Chain, Assertions, Api, Ui, Actions, Editor) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];


    var assertEq = function () {
      assertEq.count = assertEq.count === undefined ? 1 : assertEq.count + 1;
      Assertions.assertEq.apply(this, arguments);
    };

    var cAssertContentKeyboardEvent = function (cAction, evt) {
      return Chain.fromChains([
        Chain.op(function (editor) {
          editor.once(evt.type, function (e) {
            assertEq('asserting keyboard event', evt, {
              type: e.type,
              code: e.keyCode,
              modifiers: {
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey
              }
            });
          });
        }),
        cAction(evt.code, evt.modifiers),
      ]);
    };

    Pipeline.async({}, [
      Chain.asStep({}, [
        Editor.cCreate,
        cAssertContentKeyboardEvent(Actions.cContentKeypress, {
          type: 'keypress',
          code: 88,
          modifiers: {
            ctrl: true,
            shift: false,
            alt: false,
            meta: true
          }
        }),
        cAssertContentKeyboardEvent(Actions.cContentKeydown, {
          type: 'keydown',
          code: 65,
          modifiers: {
            ctrl: true,
            shift: true,
            alt: false,
            meta: true
          }
        }),
        Chain.wait(100), // give some time to async ops to finish
        Chain.op(function () {
          Assertions.assertEq(assertEq.count + ' assertions were run', 2, assertEq.count);
        }),
        Editor.cRemove
      ])
    ], function () {
      success();
    }, failure);
  }
);