import { ApproxStructure, Assertions, Logger, Mouse, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { EventArgs, Html, Insert, Remove, SugarBody, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as ForeignGui from 'ephox/alloy/api/system/ForeignGui';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as Tagger from 'ephox/alloy/registry/Tagger';

UnitTest.asynctest('Browser Test: api.ForeignGuiTest', (success, failure) => {
  const root = SugarElement.fromTag('div');
  Html.set(root, '<span class="clicker">A</span> and <span class="clicker">B</span>');

  Insert.append(SugarBody.body(), root);

  const connection = ForeignGui.engage({
    root,
    insertion: (parent, system) => {
      Insert.append(parent, system.element);
    },
    dispatchers: [
      {
        getTarget: (elem) => SugarNode.name(elem) === 'span' ? Optional.some(elem) : Optional.none(),
        alloyConfig: {
          behaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: 'selected'
            })
          ]),
          events: AlloyEvents.derive([
            AlloyEvents.run<EventArgs>(NativeEvents.click(), (component, simulatedEvent) => {
              // We have to remove the proxy first, because we are during a proxied event (click)
              connection.unproxy(component);
              connection.dispatchTo(SystemEvents.execute(), simulatedEvent.event);
            })
          ])
        }
      }
    ]
  });

  const sAssertChildHasRandomUid = (label: string, index: number) => Logger.t(
    label,
    Step.sync(() => {
      const child = Traverse.child(root, index).getOrDie('Could not find child at index: ' + index);
      const alloyUid = Tagger.readOrDie(child);
      Assertions.assertEq('Uid should have been initialised', true, alloyUid.startsWith('uid_'));
    })
  );

  const sAssertChildHasNoUid = (label: string, index: number) => Logger.t(
    label,
    Step.sync(() => {
      const child = Traverse.child(root, index).getOrDie('Could not find child at index: ' + index);
      const optUid = Tagger.read(child);
      Assertions.assertEq('Uid should NOT be set', true, optUid.isNone());
    })
  );

  Pipeline.async({}, [
    GuiSetup.mAddStyles(SugarElement.fromDom(document), [
      '.selected { color: white; background: black; }'
    ]),
    Assertions.sAssertStructure(
      'Checking initial structure ... nothing is selected',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        children: [
          s.element('span', {
            classes: [ arr.not('selected') ]
          }),
          s.text(str.is(' and ')),
          s.element('span', {
            classes: [ arr.not('selected') ]
          }),
          s.element('div', {
            // TODO: Test that the field is set.
            attrs: {
              'data-alloy-id': str.none()
            }
          })
        ]
      })),
      root
    ),

    sAssertChildHasNoUid('First child should have no uid', 0),
    sAssertChildHasRandomUid('Div should have a uid', 3),

    Mouse.sClickOn(root, 'span.clicker:first'),

    Assertions.sAssertStructure(
      'Checking structure after the first span is clicked',
      ApproxStructure.build((s, str, arr) => s.element('div', {
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
              'data-alloy-id': str.none()
            }
          })
        ]
      })),
      root
    ),

    sAssertChildHasNoUid('First child should still have no uid', 0),
    sAssertChildHasRandomUid('Div should still have a uid', 3),

    Step.sync(() => {
      connection.disengage();
      Remove.remove(root);
    })
  ], success, failure);
});
