asynctest(
  'GuiEventsTest',
 
  [
    'ephox.agar.api.Pipeline',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],
 
  function (Pipeline, Element, Insert, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var page = Element.fromTag('div');


    var body = Element.fromDom(document.body);
    Insert.append(body, page);
 
    Pipeline.async({}, [

    ], function () { success(); }, failure);

  }
);