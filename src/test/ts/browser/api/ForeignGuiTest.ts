import { ApproxStructure, Assertions, Mouse, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { Body, Element, Html, Insert, Node, Remove } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as ForeignGui from 'ephox/alloy/api/system/ForeignGui';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('Browser Test: api.ForeignGuiTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const root = Element.fromTag('div');
  Html.set(root, '<span class="clicker">A</span> and <span class="clicker">B</span>');

  Insert.append(Body.body(), root);

  const connection = ForeignGui.engage({
    root,
    insertion (parent, system) {
      Insert.append(parent, system.element());
    },
    dispatchers: [
      {
        getTarget (elem) { return Node.name(elem) === 'span' ? Option.some(elem) : Option.none(); },
        alloyConfig: {
          behaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: 'selected'
            })
          ]),
          events: AlloyEvents.derive([
            AlloyEvents.run(NativeEvents.click(), function (component, simulatedEvent) {
              // We have to remove the proxy first, because we are during a proxied event (click)
              connection.unproxy(component);
              connection.dispatchTo(SystemEvents.execute(), simulatedEvent.event());
            })
          ])
        }
      }
    ]
  });

  Pipeline.async({}, [
    GuiSetup.mAddStyles(Element.fromDom(document), [
      '.selected { color: white; background: black; }'
    ]),
    Assertions.sAssertStructure(
      'Checking initial structure ... nothing is selected',
      ApproxStructure.build(function (s, str, arr) {
        return s.element('div', {
          children: [
            s.element('span', {
              classes: [ arr.not('selected') ]
            }),
            s.text(str.is(' and ')),
            s.element('span', {
              classes: [ arr.not('selected') ]
            }),
            s.element('div', {
              attrs: {
                'data-alloy-id': str.startsWith('uid_')
              }
            })
          ]
        });
      }),
      root
    ),
    Mouse.sClickOn(root, 'span.clicker:first'),

    Assertions.sAssertStructure(
      'Checking structure after the first span is clicked',
      ApproxStructure.build(function (s, str, arr) {
        return s.element('div', {
          children: [
            s.element('span', {
              attrs: {
                'data-alloy-id': str.none()
              },
              classes: [ arr.has('selected') ]
            }),
            s.text(str.is(' and ')),
            s.element('span', {
              classes: [ arr.not('selected') ]
            }),
            s.element('div', {
              attrs: {
                'data-alloy-id': str.startsWith('uid_')
              }
            })
          ]
        });
      }),
      root
    ),

    Step.sync(function () {
      connection.disengage();
      Remove.remove(root);
    })
  ], function () { success(); }, failure);
});
