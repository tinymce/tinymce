import { ApproxStructure, Assertions, Chain, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option, Arr } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Reflecting } from 'ephox/alloy/api/behaviour/Reflecting';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';

UnitTest.asynctest('ReflectingTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    const makeChild = (label) => {
      return {
        dom: {
          tag: 'span',
          innerHtml: label,
          styles: {
            display: 'inline-block',
            border: '1px solid #ccc',
            margin: '0.5em',
            padding: '1em'
          }
        },
        behaviours: Behaviour.derive([
          AddEventsBehaviour.config('child-events', [
            AlloyEvents.runOnAttached(store.adder('child.' + label + '.attached')),
            AlloyEvents.runOnDetached(store.adder('child.' + label + '.detached'))
          ])
        ])
      };
    };

    return GuiFactory.build(
      Container.sketch({
        components: [
          {
            dom: {
              tag: 'div',
              classes: [ 'reflector-1' ]
            },
            components: [
              makeChild('state-changes-only')
            ],
            behaviours: Behaviour.derive([
              Reflecting.config({
                channel: 'channel-1',
                updateState: (_, input) => Option.some({ state: input })
              })
            ])
          },
          {
            dom: {
              tag: 'div',
              classes: [ 'reflector-2a' ]
            },
            components: [ ],
            behaviours: Behaviour.derive([
              Reflecting.config({
                channel: 'channel-2',
                renderComponents: (input) => Arr.map(input, makeChild),
                initialData: [ '2a-cat', '2a-dog' ]
              })
            ])
          },
          {
            dom: {
              tag: 'div',
              classes: [ 'reflector-2b' ]
            },
            components: [
              makeChild('render-only-inital-component')
            ],
            behaviours: Behaviour.derive([
              Reflecting.config({
                channel: 'channel-2',
                renderComponents: (input) => Arr.map(input, makeChild),
                initialData: [ '2b-cat', '2b-dog' ]
              })
            ])
          },
          {
            dom: {
              tag: 'div',
              classes: [ 'reflector-2c' ]
            },
            components: [ ],
            behaviours: Behaviour.derive([
              Reflecting.config({
                channel: 'channel-2',
                renderComponents: (input) => Arr.map(input, makeChild)
              })
            ])
          },

          {
            dom: {
              tag: 'div',
              classes: [ 'reflector-3' ]
            },
            components: [ ],
            behaviours: Behaviour.derive([
              Reflecting.config({
                channel: 'channel-3',
                renderComponents: (input, state) => Arr.map(state.map((s) => s.state).getOr([ ]), makeChild),
                updateState: (_c, input) => Option.some({ state: input })
              })
            ])
          },
        ]
      })
    );
  }, (doc, body, gui, component, store) => {
    const sAssertReflectState = (label, expected, selector) => {
      return Chain.asStep(component.element(), [
        UiFinder.cFindIn(selector),
        Chain.binder(component.getSystem().getByDom),
        Chain.op((r1) => {
          const actual = Reflecting.getState(r1).get().getOrDie();
          Assertions.assertEq('Checking state for: ' + label, expected, actual.state);
        })
      ]);
    };

    return [
      store.sAssertEq('Checking the original sequence of attached and detached', [
        'child.state-changes-only.attached',
        'child.2a-cat.attached',
        'child.2a-dog.attached',

        // This one is removed immediately due to initialData being set
        'child.render-only-inital-component.attached',
        'child.render-only-inital-component.detached',
        'child.2b-cat.attached',
        'child.2b-dog.attached',
      ]),
      store.sClear,
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('state-changes-only')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('2a-cat')) ] }),
                  s.element('span', { children: [  s.text(str.is('2a-dog')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('2b-cat')) ] }),
                  s.element('span', { children: [  s.text(str.is('2b-dog')) ] })
                ]
              }),
              s.element('div', {
                children: [ ]
              }),
              s.element('div', {
                children: [ ]
              })
            ]
          });
        }),
        component.element()
      ),

      Step.sync(() => {
        gui.broadcastOn([ 'channel-1' ], {blah: true});
      }),

      sAssertReflectState('reflector 1', {blah: true}, '.reflector-1'),
      store.sAssertEq('No attached/detached should have occurred', [ ]),

      Step.sync(() => {
        gui.broadcastOn([ 'channel-2' ], [ 'alpha', 'beta' ]);
      }),

      store.sAssertEq('Attached and detached should have occurred when broadcasting on channel 2', [
        'child.2a-cat.detached',
        'child.2a-dog.detached',
        'child.alpha.attached',
        'child.beta.attached',
        'child.2b-cat.detached',
        'child.2b-dog.detached',
        'child.alpha.attached',
        'child.beta.attached',
        'child.alpha.attached',
        'child.beta.attached'
      ]),

      Assertions.sAssertStructure(
        'Checking structure after broadcast on channel-2',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('state-changes-only')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('alpha')) ] }),
                  s.element('span', { children: [  s.text(str.is('beta')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('alpha')) ] }),
                  s.element('span', { children: [  s.text(str.is('beta')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('alpha')) ] }),
                  s.element('span', { children: [  s.text(str.is('beta')) ] })
                ]
              }),
              s.element('div', {
                children: [ ]
              })
            ]
          });
        }),
        component.element()
      ),

      Step.sync(() => {
        gui.broadcastOn([ 'channel-3' ], [ 'gamma' ]);
      }),

      Assertions.sAssertStructure(
        'Checking structure after broadcast on channel-3',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('state-changes-only')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('alpha')) ] }),
                  s.element('span', { children: [  s.text(str.is('beta')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('alpha')) ] }),
                  s.element('span', { children: [  s.text(str.is('beta')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('alpha')) ] }),
                  s.element('span', { children: [  s.text(str.is('beta')) ] })
                ]
              }),
              s.element('div', {
                children: [
                  s.element('span', { children: [  s.text(str.is('gamma')) ] }),
                ]
              })
            ]
          });
        }),
        component.element()
      ),

      sAssertReflectState('reflector3', [ 'gamma' ], '.reflector-3')
    ];
  }, () => success(), failure);
});
