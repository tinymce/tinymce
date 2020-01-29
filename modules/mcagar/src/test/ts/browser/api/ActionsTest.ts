import { Assertions, Chain, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as EditorType } from 'ephox/mcagar/alien/EditorTypes';
import { ActionChains } from 'ephox/mcagar/api/ActionChains';
import * as Editor from 'ephox/mcagar/api/Editor';

UnitTest.asynctest('ActionTest', (success, failure) =>  {
  let count: number;

  const sResetCount = Step.sync(() => count = 0);

  const assertEq = <T>(label: string, expected: T, actual: T): void => {
    count++;
    Assertions.assertEq(label, expected, actual);
  };

  const cAssertContentKeyboardEvent = (cAction: (code: number, modifiers?: Record<string, any>) => Chain<EditorType, EditorType>, evt: Record<string, any>) => {
    return Chain.fromChains([
      Chain.op((editor: EditorType) => {
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

  const sTestStep = Chain.asStep({}, [
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
    Waiter.cTryUntilPredicate('Wait for 2 assertions', (x) => count === 2),
    Editor.cRemove
  ]);

  Pipeline.async({}, [
    sResetCount,
    sTestStep
  ], function () {
    success();
  }, failure);
});
