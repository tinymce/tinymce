import { Pipeline } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import ActionChains from 'ephox/mcagar/api/ActionChains';
import Editor from 'ephox/mcagar/api/Editor';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('ActionChainsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var count = 0;

  var assertEq:any = function () {
    count++;
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
    ])
  ], function () {
    success();
  }, failure);
});

