import { Assertions, Chain, GeneralSteps, Logger, NamedChain, Pipeline, Step, Truncate, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Fun, Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Attr, Compare, Element, Html, Insert } from '@ephox/sugar';
import * as DescribedHandler from 'ephox/alloy/events/DescribedHandler';
import EventRegistry from 'ephox/alloy/events/EventRegistry';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('EventRegistryTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const body = Element.fromDom(document.body);
  const page = Element.fromTag('div');

  Html.set(page,
    '<div data-alloy-id="comp-1">' +
      '<div data-alloy-id="comp-2">' +
        '<div data-alloy-id="comp-3">' +
          '<div data-alloy-id="comp-4">' +
            '<div data-alloy-id="comp-5"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  const isRoot = Fun.curry(Compare.eq, page);

  Insert.append(body, page);

  const events = EventRegistry();

  events.registerId([ 'extra-args' ], 'comp-1', {
    'event.alpha': DescribedHandler.nu(
      function (extra) {
        return 'event.alpha.1(' + extra + ')';
      },
      'event.alpha.1.handler'
    ),
    'event.only': DescribedHandler.nu(
      function (extra) {
        return 'event.only(' + extra + ')';
      },
      'event.only.handler'
    )
  });

  events.registerId([ 'extra-args' ], 'comp-4', {
    'event.alpha': DescribedHandler.nu(
      function (extra) {
        return 'event.alpha.4(' + extra + ')';
      },
      'event.alpha.4.handler'
    )
  });

  const sAssertFilterByType = function (expected, type) {
    return Step.sync(function () {
      const filtered = events.filterByType(type);
      const raw = Arr.map(filtered, function (f) {
        return { handler: f.descHandler().handler(), purpose: f.descHandler().purpose(), id: f.id() };
      }).sort(function (f, g) {
        if (f.id < g.id) { return -1; } else if (f.id > g.id) { return +1; } else { return 0; }
      });

      Assertions.assertEq('filter(' + type + ') = ' + Json.stringify(expected), expected, raw);
    });
  };

  const sAssertNotFound = function (label, type, id) {
    return Logger.t(
      'Test: ' + label + '\nLooking for handlers for  id = ' + id + ' and event = ' + type + '. Should not find any',
      GeneralSteps.sequence([
        Chain.asStep(page, [
          UiFinder.cFindIn('[data-alloy-id="' + id + '"]'),
          Chain.binder(function (target) {
            const handler = events.find(isRoot, type, target);
            return handler.fold(function () {
              return Result.value({ });
            }, function (h) {
              return Result.error(
                'Unexpected handler found: ' + Json.stringify({
                  element: Truncate.getHtml(h.element()),
                  handler: h.handler()
                })
              );
            });
          })
        ])
      ])
    );
  };

  const sAssertFind = function (label, expected, type, id) {
    const cFindHandler = Chain.binder(function (target) {
      return events.find(isRoot, type, target);
    });

    return Logger.t(
      'Test: ' + label + '\nLooking for handlers for  id = ' + id + ' and event = ' + type,
      GeneralSteps.sequence([
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.writeValue('page', page),
            NamedChain.direct('page', UiFinder.cFindIn('[data-alloy-id="' + id + '"]'), 'target'),
            NamedChain.direct('target', cFindHandler, 'handler'),
            NamedChain.bundle(Result.value)
          ]),
          Chain.op(function (actual) {
            const section = actual.handler;
            Assertions.assertEq(
              'find(' + type + ', ' + id + ') = true',
              expected.target,
              Attr.get(section.element(), 'data-alloy-id')
            );
            Assertions.assertEq(
              'find(' + type + ', ' + id + ') = ' + Json.stringify(expected.handler),
              expected.handler,
              section.descHandler().handler()
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
  ], function () { success(); }, failure);
});
