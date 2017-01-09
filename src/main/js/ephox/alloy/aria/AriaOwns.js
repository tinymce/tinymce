define(
  'ephox.alloy.aria.AriaOwns',

  [
    'ephox.epithet.Id',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.PredicateFind',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Id, Fun, Attr, Node, PredicateFind, SelectorFind, Traverse) {
    var findAriaOwner = function (queryElem) {
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
      findAriaOwner: findAriaOwner,
      manager: manager
    };
  }
);