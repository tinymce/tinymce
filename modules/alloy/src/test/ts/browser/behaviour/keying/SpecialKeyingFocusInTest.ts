import { FocusTools, GeneralSteps, Log, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Body, Focus, SelectorFind } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('SpecialKeyingFocusInTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    {
      dom: {
        tag: 'div',
        classes: [ 'test-container' ]
      },
      components: [
        {
          dom: {
            tag: 'div',
            classes: [ 'one' ],
            innerHtml: 'one'
          },
          behaviours: Behaviour.derive([
            Focusing.config({ }),
            Keying.config({
              mode: 'special',
              focusIn: store.adder('focusIn')
            })
          ])
        },

        {
          dom: {
            tag: 'div',
            classes: [ 'two' ],
            innerHtml: 'two'
          },
          behaviours: Behaviour.derive([
            Focusing.config({ }),
            Keying.config({
              mode: 'special'
            })
          ])
        }
      ]
    }
  ), (doc, body, _gui, component, store) => {
    const oneComp = SelectorFind.descendant(component.element(), '.one').bind((elem) => component.getSystem().getByDom(elem).toOption()).getOrDie('Could not find "one" div');

    const twoComp = SelectorFind.descendant(component.element(), '.two').bind((elem) => component.getSystem().getByDom(elem).toOption()).getOrDie('Could not find "two" div');

    return [
      GuiSetup.mSetupKeyLogger(body),
      Step.sync(() => {
        Focus.focus(Body.body());
      }),
      FocusTools.sTryOnSelector('Focus should start on body', doc, 'body'),

      Log.step('TBA', 'Check focus inside a component with focusIn set does not set focus, and calls focusIn', GeneralSteps.sequence([
        store.sAssertEq('Store starts empty', [ ]),
        Step.sync(() => {
          Keying.focusIn(oneComp);
        }),
        store.sAssertEq('focusIn should have fired', [ 'focusIn' ]),
        FocusTools.sTryOnSelector('Focus should stay on body', doc, 'body'),
        store.sClear
      ])),

      Log.step('TBA', 'Check focus inside a component with no focusIn should just focus', GeneralSteps.sequence([
        store.sAssertEq('Store starts empty', [ ]),
        Step.sync(() => {
          Keying.focusIn(twoComp);
        }),
        store.sAssertEq('Nothing should have fired', [ ]),
        FocusTools.sTryOnSelector('Focus should move to cTwo', doc, '.two')
      ])),

      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, () => { success(); }, failure);
});
