import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { Attr, Element, EventArgs, Html, Insert, SelectorFind } from '@ephox/sugar';

import * as Debugging from 'ephox/alloy/debugging/Debugging';
import * as Triggers from 'ephox/alloy/events/Triggers';

UnitTest.asynctest('TriggersTest', (success, failure) => {
  let log: string[] = [ ];

  const make = (stop: boolean, message: string) => (labEvent: EventArgs) => {
    log.push(message);
    if (stop) { labEvent.stop(); }
  };

  // OK for this test, we need to start with a list of events which may or may not stop
  const domEvents = {
    'no.stop': {
      alpha: make(false, 'alpha'),
      beta: make(false, 'beta'),
      gamma: make(false, 'gamma')
    },
    'gamma.stop': {
      alpha: make(false, 'alpha'),
      beta: make(false, 'beta'),
      gamma: make(true, 'gamma')
    },
    'beta.stop': {
      alpha: make(false, 'alpha'),
      beta: make(true, 'beta'),
      gamma: make(false, 'gamma')
    },
    'alpha.stop': {
      alpha: make(true, 'alpha'),
      beta: make(false, 'beta'),
      gamma: make(false, 'gamma')
    },
    'gamma.alpha.stop': {
      alpha: make(true, 'alpha'),
      beta: make(false, 'beta'),
      gamma: make(true, 'gamma')
    },
    'gamma.beta.stop': {
      alpha: make(false, 'alpha'),
      beta: make(true, 'beta'),
      gamma: make(true, 'gamma')
    },
    'beta.alpha.stop': {
      alpha: make(true, 'alpha'),
      beta: make(true, 'beta'),
      gamma: make(false, 'gamma')
    },
    'all.stop': {
      alpha: make(true, 'alpha'),
      beta: make(true, 'beta'),
      gamma: make(true, 'gamma')
    }
  };

  const logger = Debugging.noLogger();

  const lookup = (eventType: string, target: Element) =>
    Attr.getOpt(target, 'data-event-id').bind((targetId) =>
      Obj.get(domEvents as any, eventType).bind((x) => Obj.get(x, targetId)).map((h: Function) => ({
        descHandler: {
          cHandler: h,
          purpose: Fun.constant('purpose')
        },
        element: target
      })));

  const container = Element.fromTag('div');
  const body = Element.fromDom(document.body);

  const sCheck = (label: string, expected: string[], target: string, eventType: string) => Logger.t(label, Step.sync(() => {
    Html.set(container, '<div data-event-id="alpha"><div data-event-id="beta"><div data-event-id="gamma"></div></div></div>');
    const targetEl = SelectorFind.descendant(container, '[data-event-id="' + target + '"]').getOrDie();
    Triggers.triggerOnUntilStopped(lookup, eventType, { } as any, targetEl, logger);
    Assertions.assertEq(label, expected, log.slice(0));
    log = [ ];
  }));

  Insert.append(body, container);

  const cases = [
    { expected: [ 'gamma', 'beta', 'alpha' ], target: 'gamma', type: 'no.stop' },
    { expected: [ 'beta', 'alpha' ], target: 'beta', type: 'no.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'no.stop' },

    { expected: [ 'gamma' ], target: 'gamma', type: 'gamma.stop' },
    { expected: [ 'beta', 'alpha' ], target: 'beta', type: 'gamma.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'gamma.stop' },

    { expected: [ 'gamma', 'beta' ], target: 'gamma', type: 'beta.stop' },
    { expected: [ 'beta' ], target: 'beta', type: 'beta.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'beta.stop' },

    { expected: [ 'gamma', 'beta', 'alpha' ], target: 'gamma', type: 'alpha.stop' },
    { expected: [ 'beta', 'alpha' ], target: 'beta', type: 'alpha.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'alpha.stop' },

    { expected: [ 'gamma' ], target: 'gamma', type: 'gamma.beta.stop' },
    { expected: [ 'beta' ], target: 'beta', type: 'gamma.beta.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'gamma.beta.stop' },

    { expected: [ 'gamma' ], target: 'gamma', type: 'gamma.alpha.stop' },
    { expected: [ 'beta', 'alpha' ], target: 'beta', type: 'gamma.alpha.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'gamma.alpha.stop' },

    { expected: [ 'gamma', 'beta' ], target: 'gamma', type: 'beta.alpha.stop' },
    { expected: [ 'beta' ], target: 'beta', type: 'beta.alpha.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'beta.alpha.stop' },

    { expected: [ 'gamma' ], target: 'gamma', type: 'all.stop' },
    { expected: [ 'beta' ], target: 'beta', type: 'all.stop' },
    { expected: [ 'alpha' ], target: 'alpha', type: 'all.stop' }
  ];

  const steps = Arr.map(cases, (c) => sCheck(
    'fire(' + c.target + ') using event: ' + c.type,
    c.expected,
    c.target,
    c.type
  ));

  Pipeline.async({}, steps, () => { success(); }, failure);
});
