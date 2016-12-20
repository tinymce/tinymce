define(
  'ephox.sugar.api.properties.Html',

  [
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Elements',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Element, Elements, Insert, InsertAll, Remove, Traverse) {
    var get = function (element) {
      return element.dom().innerHTML;
    };

    var set = function (element, content) {
      var owner = Traverse.owner(element);
      var docDom = owner.dom();

      // FireFox has *terrible* performance when using innerHTML = x
      var fragment = Element.fromDom(docDom.createDocumentFragment());
      var contentElements = Elements.fromHtml(content, docDom);
      InsertAll.append(fragment, contentElements);

      Remove.empty(element);
      Insert.append(element, fragment);
    };

    var getOuter = function (element) {
      var container = Element.fromTag('div');
      var clone = Element.fromDom(element.dom().cloneNode(true));
      Insert.append(container, clone);
      return get(container);
    };

    return {
      get: get,
      set: set,
      getOuter: getOuter
    };
  }
);
