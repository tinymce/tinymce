import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell, Fun } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.dom.SelectionEventsTest', (success, failure) => {

  Theme();

  const mBindEventMutator = (editor, eventName, mutator) => {
    return Step.stateful((_value, next, _die) => {
      const eventArgs = Cell(null);

      const handler = (e) => {
        mutator(editor, e);
        eventArgs.set(e);
      };

      editor.on(eventName, handler);
      next({ eventArgs, handler });
    });
  };

  const mBindEvent = (editor, eventName) => {
    return mBindEventMutator(editor, eventName, Fun.noop);
  };

  const mUnbindEvent = (editor, eventName) => {
    return Step.stateful((value: any, next, _die) => {
      editor.off(eventName, value.handler);
      next({});
    });
  };

  const mAssertSetSelectionEventArgs = (editor, expectedForward) => {
    return Step.stateful((value: any, next, _die) => {
      Assertions.assertEq('Should be expected forward flag', expectedForward, value.eventArgs.get().forward);
      assertSelectAllRange(editor, value.eventArgs.get().range);
      next(value);
    });
  };

  const getSelectAllRng = (editor) => {
    const rng = document.createRange();
    rng.setStartBefore(editor.getBody().firstChild);
    rng.setEndAfter(editor.getBody().firstChild);
    return rng;
  };

  const sSetRng = (editor, forward) => {
    return Step.sync(() => {
      editor.selection.setRng(getSelectAllRng(editor), forward);
    });
  };

  const sGetRng = (editor, _forward?) => {
    return Step.sync(() => {
      editor.selection.getRng();
    });
  };

  const selectAll = (editor, eventArgs) => {
    eventArgs.range = getSelectAllRng(editor);
  };

  const assertSelectAllRange = (editor, actualRng) => {
    Assertions.assertDomEq(
      'Should be expected startContainer',
      SugarElement.fromDom(editor.getBody()),
      SugarElement.fromDom(actualRng.startContainer)
    );

    Assertions.assertDomEq(
      'Should be expected endContainer',
      SugarElement.fromDom(editor.getBody()),
      SugarElement.fromDom(actualRng.endContainer)
    );
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    Pipeline.async({}, [
      tinyApis.sFocus(),
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
        Step.stateful((value, next, _die) => {
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
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sGetRng(editor),
        Step.stateful((value, next, _die) => {
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
