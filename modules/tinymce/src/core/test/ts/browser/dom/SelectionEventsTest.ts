import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { Cell, Fun } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.dom.SelectionEventsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const mBindEventMutator = function (editor, eventName, mutator) {
    return Step.stateful(function (value, next, die) {
      const eventArgs = Cell(null);

      const handler = function (e) {
        mutator(editor, e);
        eventArgs.set(e);
      };

      editor.on(eventName, handler);
      next({ eventArgs, handler });
    });
  };

  const mBindEvent = function (editor, eventName) {
    return mBindEventMutator(editor, eventName, Fun.noop);
  };

  const mUnbindEvent = function (editor, eventName) {
    return Step.stateful(function (value: any, next, die) {
      editor.off(eventName, value.handler);
      next({});
    });
  };

  const mAssertSetSelectionEventArgs = function (editor, expectedForward) {
    return Step.stateful(function (value: any, next, die) {
      Assertions.assertEq('Should be expected forward flag', expectedForward, value.eventArgs.get().forward);
      assertSelectAllRange(editor, value.eventArgs.get().range);
      next(value);
    });
  };

  const getSelectAllRng = function (editor) {
    const rng = document.createRange();
    rng.setStartBefore(editor.getBody().firstChild);
    rng.setEndAfter(editor.getBody().firstChild);
    return rng;
  };

  const sSetRng = function (editor, forward) {
    return Step.sync(function () {
      editor.selection.setRng(getSelectAllRng(editor), forward);
    });
  };

  const sGetRng = function (editor, forward?) {
    return Step.sync(function () {
      editor.selection.getRng();
    });
  };

  const selectAll = function (editor, eventArgs) {
    eventArgs.range = getSelectAllRng(editor);
  };

  const assertSelectAllRange = function (editor, actualRng) {
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
    const tinyApis = TinyApis(editor);
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
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
