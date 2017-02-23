define(
  'ephox.alloy.aria.AriaOwner',

  [
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Id, Fun, Attr, Node, PredicateFind, SelectorFind, Traverse) {
    var find = function (queryElem) {
      var dependent = PredicateFind.closest(queryElem, function (elem) {
        if (! Node.isElement(elem)) return false;
        var id = Attr.get(elem, 'id');
        return id !== undefined && id.indexOf('aria-owns') > -1;
      });

      return dependent.bind(function (dep) {
        var id = Attr.get(dep, 'id');
        var doc = Traverse.owner(dep);

        return SelectorFind.descendant(doc, '[aria-owns="' + id + '"]');
      });
    };

    var manager = function () {
      var ariaId = Id.generate('aria-owns');

      var link = function (elem) {
        Attr.set(elem, 'aria-owns', ariaId);
      };

      var unlink = function (elem) {
        Attr.remove(elem, 'aria-owns');
      };

      return {
        id: Fun.constant(ariaId),
        link: link,
        unlink: unlink
      };
    };

    return {
      find: find,
      manager: manager
    };
  }
);