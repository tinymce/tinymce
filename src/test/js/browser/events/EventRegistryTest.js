asynctest(
  'EventRegistryTest',
 
  [
    'ephox.agar.alien.Truncate',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.events.EventRegistry',
    'ephox.compass.Arr',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'global!document'
  ],
 
  function (Truncate, Assertions, Chain, GeneralSteps, Logger, NamedChain, Pipeline, Step, UiFinder, EventRegistry, Arr, Json, Fun, Result, Attr, Compare, Element, Html, Insert, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];


    var body = Element.fromDom(document.body);
    var page = Element.fromTag('div');

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

    var isRoot = Fun.curry(Compare.eq, page);

    Insert.append(body, page);

    var events = EventRegistry();

    events.registerId([ 'extra-args' ], 'comp-1', {
      'event.alpha': function (extra) {
        return 'event.alpha.1(' + extra + ')';
      },
      'event.only': function (extra) {
        return 'event.only(' + extra + ')';
      }
    });

    events.registerId([ 'extra-args' ], 'comp-4', {
      'event.alpha': function (extra) {
        return 'event.alpha.4(' + extra + ')';
      }
    });
 
    var sAssertFilterByType = function (expected, type) {
      return Step.sync(function () {
        var filtered = events.filterByType(type);
        var raw = Arr.map(filtered, function (f) {
          return { handler: f.handler(), id: f.id() };
        }).sort(function (f, g) {
          if (f.id < g.id) return -1;
          else if (f.id > g.id) return +1;
          else return 0;
        });

        Assertions.assertEq('filter(' + type + ') = ' + Json.stringify(expected), expected, raw);
      });
    };

    var sAssertNotFound = function (label, type, id) {
      return Logger.t(
        'Test: ' + label + '\nLooking for handlers for  id = ' + id + ' and event = ' + type + '. Should not find any',
        GeneralSteps.sequence([
          Chain.asStep(page, [
            UiFinder.cFindIn('[data-alloy-id="' + id + '"]'),
            Chain.binder(function (target) {
              var handler = events.find(isRoot, type, target);
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

    var sAssertFind = function (label, expected, type, id) {
      var cFindHandler = Chain.binder(function (target) {
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
              Assertions.assertEq(
                'find(' + type + ', ' + id + ') = true', 
                expected.target,
                Attr.get(actual.handler.element(), 'data-alloy-id')
              );
              Assertions.assertEq(
                'find(' + type + ', ' + id + ') = ' + Json.stringify(expected.handler),
                expected.handler,
                actual.handler.handler()
              );
            })
          ])
        ])
      );
    };

    Pipeline.async({}, [
      sAssertFilterByType([ ], 'event.none'),
      sAssertFilterByType([
        { handler: 'event.alpha.1(extra-args)', id: 'comp-1' },
        { handler: 'event.alpha.4(extra-args)', id: 'comp-4' }
      ], 'event.alpha' ),


      sAssertFind('comp-1!', { handler: 'event.alpha.1(extra-args)', target: 'comp-1' }, 'event.alpha', 'comp-1'),

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

  }
);