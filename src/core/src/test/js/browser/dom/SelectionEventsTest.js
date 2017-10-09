asynctest(
  'browser.tinymce.core.dom.SelectionEventsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'global!document',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, Cell, Fun, TinyApis, TinyLoader, Element, document, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var mBindEventMutator = function (editor, eventName, mutator) {
      return Step.stateful(function (value, next, die) {
        var eventArgs = Cell();

        var handler = function (e) {
          mutator(editor, e);
          eventArgs.set(e);
        };

        editor.on(eventName, handler);
        next({ eventArgs: eventArgs, handler: handler });
      });
    };

    var mBindEvent = function (editor, eventName) {
      return mBindEventMutator(editor, eventName, Fun.noop);
    };

    var mUnbindEvent = function (editor, eventName) {
      return Step.stateful(function (value, next, die) {
        editor.off(eventName, value.handler);
        next({});
      });
    };

    var mAssertSetSelectionEventArgs = function (editor, expectedForward) {
      return Step.stateful(function (value, next, die) {
        Assertions.assertEq('Should be expected forward flag', expectedForward, value.eventArgs.get().forward);
        assertSelectAllRange(editor, value.eventArgs.get().range);
        next(value);
      });
    };

    var getSelectAllRng = function (editor) {
      var rng = document.createRange();
      rng.setStartBefore(editor.getBody().firstChild);
      rng.setEndAfter(editor.getBody().firstChild);
      return rng;
    };

    var sSetRng = function (editor, forward) {
      return Step.sync(function () {
        editor.selection.setRng(getSelectAllRng(editor), forward);
      });
    };

    var sGetRng = function (editor, forward) {
      return Step.sync(function () {
        editor.selection.getRng();
      });
    };

    var selectAll = function (editor, eventArgs) {
      eventArgs.range = getSelectAllRng(editor);
    };

    var assertSelectAllRange = function (editor, actualRng) {
      Assertions.assertDomEq(
        'Should be expected startContainer',
        Element.fromDom(editor.getBody()),
        Element.fromDom(actualRng.startContainer)
      );

      Assertions.assertDomEq(
        'Should be expected endContainer',
        Element.fromDom(editor.getBody()),
        Element.fromDom(actualRng.endContainer)
      );
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('SetSelectionRange event', GeneralSteps.sequence([
          mBindEvent(editor, 'SetSelectionRange'),
          tinyApis.sSetContent('<p>a</p>'),
          sSetRng(editor, undefined),
          mAssertSetSelectionEventArgs(editor, undefined),
          sSetRng(editor, true),
          mAssertSetSelectionEventArgs(editor, true),
          sSetRng(editor, false),
          mAssertSetSelectionEventArgs(editor, false),
          mUnbindEvent(editor, 'SetSelectionRange')
        ])),
        Logger.t('AfterSetSelectionRange event', GeneralSteps.sequence([
          mBindEvent(editor, 'AfterSetSelectionRange'),
          tinyApis.sSetContent('<p>a</p>'),
          sSetRng(editor, undefined),
          Step.stateful(function (value, next, die) {
            Assertions.assertEq('', 'undefined', typeof value.eventArgs.get().forward);
            next(value);
          }),
          sSetRng(editor, true),
          mAssertSetSelectionEventArgs(editor, true),
          sSetRng(editor, false),
          mAssertSetSelectionEventArgs(editor, false),
          mUnbindEvent(editor, 'AfterSetSelectionRange')
        ])),
        Logger.t('GetSelectionRange event', GeneralSteps.sequence([
          mBindEventMutator(editor, 'GetSelectionRange', selectAll),
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 0),
          sGetRng(editor),
          Step.stateful(function (value, next, die) {
            assertSelectAllRange(editor, editor.selection.getRng());
            assertSelectAllRange(editor, value.eventArgs.get().range);
            next(value);
          }),
          mUnbindEvent(editor, 'GetSelectionRange')
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
