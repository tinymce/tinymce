import { FocusTools } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import Tabstopping from 'ephox/alloy/api/behaviour/Tabstopping';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Button from 'ephox/alloy/api/ui/Button';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Objects } from '@ephox/boulder';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Cyclic Keying Test', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    var makeButton = function (v, t) {
      return Button.sketch({
        dom: { tag: 'button', innerHtml: t },
        action: store.adder(v + '.clicked'),
        buttonBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ])
      });
    };

    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div',
          classes: [ 'cyclic-keying-test'],
          styles: {
            background: 'blue',
            width: '200px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        containerBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic'
          })
        ]),
        components: [
          makeButton('button1', 'Button1'),
          makeButton('button2', 'Button2'),
          Container.sketch({
            dom: {
              tag: 'span',
              classes: [ 'focusable-span' ],
              styles: {
                'display': 'inline-block',
                'width': '200px',
                'border': '1px solid green',
                background: 'white',
                height: '20px'
              }
            },
            containerBehaviours: Objects.wrapAll([
              Tabstopping.config({ }),
              Focusing.config({ })
            ])
          })
        ]
      })
    );

  }, function (doc, body, gui, component, store) {
    return [
      GuiSetup.mSetupKeyLogger(body),
      Step.sync(function () {
        Keying.focusIn(component);
      }),
      FocusTools.sTryOnSelector(
        'Focus should be on button 1 after focusIn',
        doc,
        'button:contains("Button1")'
      ),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector(
        'Focus should move from button 1 to button 2',
        doc,
        'button:contains("Button2")'
      ),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector(
        'Focus should move from button 2 to span',
        doc,
        'span.focusable-span'
      ),

      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector(
        'Focus should move from span to button 1',
        doc,
        'button:contains("Button1")'
      ),

      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector(
        'Focus should move from button1 to span',
        doc,
        'span.focusable-span'
      ),

      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector(
        'Focus should move from span to button 2',
        doc,
        'button:contains("Button2")'
      ),

      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector(
        'Focus should move from button2 to button 1',
        doc,
        'button:contains("Button1")'
      ),
      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, function () {
    success();
  }, failure);
});

