import { Assertions, Chain, GeneralSteps, Logger, NamedChain, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr, Fun, Result } from '@ephox/katamari';
import { Attr, Compare, Element, Html, Insert, SelectorFilter, Truncate } from '@ephox/sugar';

import * as DescribedHandler from 'ephox/alloy/events/DescribedHandler';
import EventRegistry, { ElementAndHandler } from 'ephox/alloy/events/EventRegistry';
import * as Tagger from 'ephox/alloy/registry/Tagger';

type ExpectedType = { id?: string; handler: string; target?: string; purpose?: string };

UnitTest.asynctest('EventRegistryTest', (success, failure) => {
  const body = Element.fromDom(document.body);
  const page = Element.fromTag('div');

  Html.set(page,
    '<div data-test-uid="comp-1">' +
      '<div data-test-uid="comp-2">' +
        '<div data-test-uid="comp-3">' +
          '<div data-test-uid="comp-4">' +
            '<div data-test-uid="comp-5"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  // Add alloy UID tags to match these attributes.
  const pageBits = SelectorFilter.descendants(page, '[data-test-uid]');
  Arr.each(pageBits, (bit) => {
    Attr.getOpt(bit, 'data-test-uid').each((testUid) => Tagger.writeOnly(bit, testUid));
  });

  const isRoot = Fun.curry(Compare.eq, page);

  Insert.append(body, page);

  const events = EventRegistry();

  events.registerId([ 'extra-args' ], 'comp-1', {
    'event.alpha': DescribedHandler.uncurried(
      (extra: string) => 'event.alpha.1(' + extra + ')',
      'event.alpha.1.handler'
    ),
    'event.only': DescribedHandler.uncurried(
      (extra: string) => 'event.only(' + extra + ')',
      'event.only.handler'
    )
  });

  events.registerId([ 'extra-args' ], 'comp-4', {
    'event.alpha': DescribedHandler.uncurried(
      (extra: string) => 'event.alpha.4(' + extra + ')',
      'event.alpha.4.handler'
    )
  });

  const sAssertFilterByType = (expected: ExpectedType[], type: string) => Step.sync(() => {
    const filtered = events.filterByType(type);
    const raw = Arr.map(filtered, (f) => ({
      // Invoke the handler
      handler: f.descHandler().cHandler(),
      purpose: f.descHandler().purpose(),
      id: f.id()
    })).sort((f, g) => {
      if (f.id < g.id) { return -1; } else if (f.id > g.id) { return +1; } else { return 0; }
    });

    Assertions.assertEq(() => 'filter(' + type + ') = ' + JSON.stringify(expected), expected, raw);
  });

  const sAssertNotFound = (label: string, type: string, id: string) => Logger.t(
    'Test: ' + label + '\nLooking for handlers for  id = ' + id + ' and event = ' + type + '. Should not find any',
    GeneralSteps.sequence([
      Chain.asStep(page, [
        UiFinder.cFindIn('[data-test-uid="' + id + '"]'),
        Chain.binder((target) => {
          const handler = events.find(isRoot, type, target);
          return handler.fold(() => Result.value({ }), (h) => Result.error(
            'Unexpected handler found: ' + JSON.stringify({
              element: Truncate.getHtml(h.element),
              // INVESTIGATE: Should this have changed?
              handler: h.descHandler
            })
          ));
        })
      ])
    ])
  );

  const sAssertFind = (label: string, expected: ExpectedType, type: string, id: string) => {
    const cFindHandler = Chain.binder((target: Element) => events.find(isRoot, type, target).fold(
      () => Result.error('No event handler for ' + type + ' on ' + target.dom()),
      Result.value
    ));

    return Logger.t(
      'Test: ' + label + '\nLooking for handlers for  id = ' + id + ' and event = ' + type,
      GeneralSteps.sequence([
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.writeValue('page', page),
            NamedChain.direct('page', UiFinder.cFindIn('[data-test-uid="' + id + '"]'), 'target'),
            NamedChain.direct('target', cFindHandler, 'handler'),
            NamedChain.bundle(Result.value)
          ]),
          Chain.op((actual) => {
            const section: ElementAndHandler = actual.handler;
            Assertions.assertEq(
              'find(' + type + ', ' + id + ') = true',
              expected.target,
              Attr.get(section.element, 'data-test-uid')
            );
            Assertions.assertEq(
              () => 'find(' + type + ', ' + id + ') = ' + JSON.stringify(expected.handler),
              expected.handler,
              section.descHandler.cHandler()
            );
          })
        ])
      ])
    );
  };

  Pipeline.async({}, [
    sAssertFilterByType([ ], 'event.none'),
    sAssertFilterByType([
      { handler: 'event.alpha.1(extra-args)', id: 'comp-1', purpose: 'event.alpha.1.handler' },
      { handler: 'event.alpha.4(extra-args)', id: 'comp-4', purpose: 'event.alpha.4.handler' }
    ], 'event.alpha'),

    sAssertFind('comp-1!',
      { handler: 'event.alpha.1(extra-args)', target: 'comp-1', purpose: 'event.alpha.1.handler' },
      'event.alpha', 'comp-1'
    ),

    sAssertFind('comp-2 > comp-1', { handler: 'event.alpha.1(extra-args)', target: 'comp-1' }, 'event.alpha', 'comp-2'),

    sAssertFind('comp-3 > comp-2 > comp-1', { handler: 'event.alpha.1(extra-args)', target: 'comp-1' }, 'event.alpha', 'comp-3'),

    sAssertFind('comp-4!', { handler: 'event.alpha.4(extra-args)', target: 'comp-4' }, 'event.alpha', 'comp-4'),

    sAssertFind('comp-5 > comp-4!', { handler: 'event.alpha.4(extra-args)', target: 'comp-4' }, 'event.alpha', 'comp-5'),

    sAssertNotFound('comp-5 > comp-4 > comp-3 > comp-2 > comp-1 > NOT FOUND', 'event.beta', 'comp-5'),

    sAssertFind(
      'comp-5 > comp-4 > comp-3 > comp-2 > comp-1!',
      { handler: 'event.only(extra-args)', target: 'comp-1' },
      'event.only', 'comp-5'
    )
  ], () => { success(); }, failure);
});
