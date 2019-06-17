import { Assertions, Chain, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import ActionChains from 'ephox/mcagar/api/ActionChains';
import Editor from 'ephox/mcagar/api/Editor';

UnitTest.asynctest('ActionTest', (success, failure) =>  {
  let count;

  const sResetCount = Step.sync(() => count = 0);

  const assertEq:any = function () {
    count++;
    Assertions.assertEq.apply(this, arguments);
  };

  const cAssertContentKeyboardEvent = (cAction, evt) => {
    return Chain.fromChains([
      Chain.op((editor) => {
        editor.once(evt.type, (e) => {
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

  const sTestStep = (major, minor) => Chain.asStep({}, [
    Editor.cFromSettings({base_url: '/project/tinymce/js/tinymce'}),
    cAssertContentKeyboardEvent(ActionChains.cContentKeypress, {
      type: 'keypress',
      code: 88,
      modifiers: {
        ctrl: true,
        shift: false,
        alt: false,
        meta: true
      }
    }),
    cAssertContentKeyboardEvent(ActionChains.cContentKeydown, {
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
      Assertions.assertEq(count + ' assertions were run', 2, count);
    }),
    Editor.cRemove
  ]);

  Pipeline.async({}, [
    sResetCount,
    sTestStep(5, 0)
  ], function () {
    success();
  }, failure);
});