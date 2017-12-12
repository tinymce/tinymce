import { FocusTools } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Objects } from '@ephox/boulder';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('SpecialKeyingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          classes: 'special-keying'
        },
        containerBehaviours: Behaviour.derive([
          Focusing.config({ }),
          Keying.config({
            mode: 'special',
            onSpace: store.adderH('space'),
            onEnter: store.adderH('enter'),
            onShiftEnter: store.adderH('shift+enter'),
            onLeft: store.adderH('left'),
            onUp: store.adderH('up'),
            onDown: store.adderH('down'),
            onRight: store.adderH('right'),
            onEscape: store.adderH('escape')
          })
        ])
      })
    );

  }, function (doc, body, gui, component, store) {
    var press = function (expected, key, modifiers) {
      return GeneralSteps.sequence([
        store.sClear,
        Keyboard.sKeydown(doc, key, modifiers),
        store.sAssertEq('Pressing ' + expected, [ expected ])
      ]);
    };

    return [
      GuiSetup.mSetupKeyLogger(body),
      FocusTools.sSetFocus('Start on component', gui.element(), '.special-keying'),
      press('space', Keys.space(), { }),
      press('enter', Keys.enter(), { }),
      press('shift+enter', Keys.enter(), { shift: true }),
      press('left', Keys.left(), { }),
      press('up', Keys.up(), { }),
      press('down', Keys.down(), { }),
      press('right', Keys.right(), { }),
      press('escape', Keys.escape(), { }),
      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, function () { success(); }, failure);
});

