asynctest(
  'EventRegistryTest',
 
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.alloy.events.EventRegistry',
    'ephox.numerosity.api.JSON',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'global!document'
  ],
 
  function (Pipeline, RawAssertions, Step, EventRegistry, Json, Element, Html, Insert, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];


    var body = Element.fromDom(document.body);
    var page = Element.fromTag('div');

    Html.set(page, 
      '<div alloy-id="comp-1">' +
        '<div alloy-id="comp-2">' +
          '<div alloy-id="comp-3">' +
            '<div alloy-id="comp-4">' +
              '<div alloy-id-"comp-5"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    Insert.append(body, page);

    var events = EventRegistry();

    events.registerId([ 'extraArgs' ], 'comp-1', {
      'event.alpha': 'handler.alpha'
    });
 
    var sAssertFilterByType = function (expected, type) {
      return Step.sync(function () {
        var filtered = events.filterByType(type);
        RawAssertions.assertEq('filter(' + type + ') = ' + Json.stringify(expected), expected, filtered);
      });
    };

    Pipeline.async({}, [
      sAssertFilterByType([ ], 'event.none')

    ], function () { success(); }, failure);

  }
);