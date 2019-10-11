import { ApproxStructure, Assertions, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Css } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Transitioning } from 'ephox/alloy/api/behaviour/Transitioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as PhantomSkipper from 'ephox/alloy/test/PhantomSkipper';

UnitTest.asynctest('TransitioningTest', (success, failure) => {

  if (PhantomSkipper.skip()) { return success(); }

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'test-container' ],
        innerHtml: '<p>This is the contents</p>'
      },
      behaviours: Behaviour.derive([
        Transitioning.config({
          initialState: 'alpha',
          routes: Transitioning.createTristate('alpha', 'beta', 'gamma', {
            transition: {
              property: 'opacity',
              transitionClass: 'transitioning'
            }
          }),
          onTransition (comp, route) {
            store.adder(route.start + '->' + route.destination)();
          },
          onFinish (comp, finishState) {
            store.adder('finish: ' + finishState)();
          }
        })
      ])
    });

  }, (doc, body, gui, component, store) => {
    return [
      GuiSetup.mAddStyles(doc, [
        '.transitioning { transition: opacity 1s ease; }',
        // TODO INVESTIGATE: The first part of this selector looks wrong
        '[data-transitioning-state="gamma"], div[data-transitioning-state="gamma"]:not(.transitioning), div[data-transitioning-destination="gamma"] { opacity: 0.5 }',
        '[data-transitioning-state="gamma"], div[data-transitioning-state="alpha"]:not(.transitioning), div[data-transitioning-destination="alpha"] { opacity: 0.8 }',
        '[data-transitioning-state="gamma"], div[data-transitioning-state="beta"]:not(.transitioning), div[data-transitioning-destination="beta"] { opacity: 0.2 }'
      ]),
      Step.sync(() => {
        Css.reflow(component.element());
      }),
      Assertions.sAssertStructure(
        'Checking initial state',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            attrs: {
              'data-transitioning-state': str.is('alpha'),
              'data-transitioning-destination': str.none()
            }
          });
        }),
        component.element()
      ),
      store.sAssertEq('Checking initial state is empty', [ ]),
      Step.sync(() => {
        Transitioning.jumpTo(component, 'gamma');
      }),
      store.sAssertEq('Checking finish is added to store', [
        'finish: gamma'
      ]),
      Assertions.sAssertStructure(
        'Checking transitioned state to gamma (jump)',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            attrs: {
              'data-transitioning-state': str.is('gamma'),
              'data-transitioning-destination': str.none()
            }
          });
        }),
        component.element()
      ),
      store.sClear,
      Step.wait(0),
      Step.sync(() => {
        Transitioning.progressTo(component, 'beta');
      }),
      Assertions.sAssertStructure(
        'Checking transitioned state to beta (progress)',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            attrs: {
              'data-transitioning-state': str.is('gamma'),
              'data-transitioning-destination': str.is('beta')
            }
          });
        }),
        component.element()
      ),
      Waiter.sTryUntil(
        'Waiting until state gets to beta',
        store.sAssertEq('Checking state', [
          'finish: beta',
          'gamma->beta'
        ])
      ),
      store.sClear,
      Step.sync(() => {
        Transitioning.progressTo(component, 'alpha');
      }),
      Waiter.sTryUntil(
        'Waiting until state gets to alpha',
        store.sAssertEq('Checking state', [
          'finish: alpha',
          'beta->alpha'
        ])
      )
    ];
  }, () => { success(); }, failure);
});
