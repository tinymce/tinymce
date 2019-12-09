import { FocusTools, Keyboard, Keys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { FocusInsideModes } from 'ephox/alloy/keying/KeyingModeTypes';

UnitTest.asynctest('Widget Keying Test', (success, failure) => {

  /*
   * This tests the example scenario where a bounded cyclic layout is contained
   * within a widget, but to enter that cycle, you must press enter (or space)
   * on the widget. Focusing the widget itself will not move into the inner cycle.
   * It must be triggered manually.
   *
   * Note, the widget needs to use a different attribute for tabstops, otherwise
   * you will tab into the inner parts from outside.
   */

  GuiSetup.setup((store, doc, body) => {
    const makeButton = (v: string, t: string) => {
      return Button.sketch({
        dom: { tag: 'button', innerHtml: t },
        action: store.adder(v + '.clicked'),
        buttonBehaviours: Behaviour.derive([
          Tabstopping.config({
            tabAttr: 'data-widget-tabstop'
          })
        ])
      });
    };

    const makeWidget = (classes: string[]) => {
      return {
        dom: {
          tag: 'div',
          classes,
          styles: {
            padding: '1em',
            margin: '1em',
            background: 'green'
          }
        },
        components: [
          makeButton('button1', 'Button1'),
          makeButton('button2', 'Button2'),
        ],

        behaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic',
            selector: '[data-widget-tabstop]',
            focusInside: FocusInsideModes.OnEnterOrSpaceMode,
            onEscape: (comp) => {
              Focusing.focus(comp);
              return Option.some<boolean>(true);
            }
          }),
          Focusing.config({ }),
          Tabstopping.config({ })
        ])
      };
    };

    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div',
          classes: [ 'widget-keying-test'],
          styles: {
            background: 'blue',
            padding: '1em'
          }
        },
        containerBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic'
          })
        ]),
        components: [
          makeWidget([ 'one' ]),
          makeWidget([ 'two' ]),
          makeWidget([ 'three' ])
        ]
      })
    );

  }, (doc, body, gui, component, store) => {
    return [
      GuiSetup.mAddStyles(doc, [
        ':focus { outline: 3px solid red; }'
      ]),
      GuiSetup.mSetupKeyLogger(body),
      Step.sync(() => {
        Keying.focusIn(component);
      }),
      FocusTools.sTryOnSelector(
        'Focus should be on widget 1',
        doc,
        'div.one'
      ),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector(
        'Focus should be on widget 2',
        doc,
        'div.two'
      ),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector(
        'Focus should be on widget 3',
        doc,
        'div.three'
      ),

      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector(
        'Focus should be on widget 1',
        doc,
        'div.one'
      ),

      Keyboard.sKeydown(doc, Keys.enter(), { }),
      FocusTools.sTryOnSelector(
        'Focus should move inside widget to button1 inside widget',
        doc,
        'div.one button:contains("Button1")'
      ),

      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector(
        'Focus should move to button 2',
        doc,
        'button:contains("Button2")'
      ),

      Keyboard.sKeydown(doc, Keys.escape(), { }),
      FocusTools.sTryOnSelector(
        'Focus should move back to widget',
        doc,
        'div.one'
      ),

      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector(
        'Focus should move to widget 3',
        doc,
        'div.three'
      ),

      GuiSetup.mRemoveStyles,
      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, () => {
    success();
  }, failure);
});
