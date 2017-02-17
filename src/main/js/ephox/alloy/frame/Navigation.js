define(
  'ephox.alloy.frame.Navigation',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'global!document'
  ],

  function (Option, Element, Traverse, document) {
    var view = function (doc) {
      // Only walk up to the document this script is defined in.
      // This prevents walking up to the parent window when the editor is in an iframe.
      var element = doc.dom() === document ?
                      Option.none()
                    : Option.from(doc.dom().defaultView.frameElement);
      return element.map(Element.fromDom);
    };

    var owner = function (element) {
      return Traverse.owner(element);
    };

    return {
      view: view,
      owner: owner
    };
  }
);
