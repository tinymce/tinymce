define(
  'ephox.alloy.registry.Tagger',

  [
    'ephox.epithet.Id',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Id, Fun, Option, Attr, Node, SelectorFind) {
    var prefix = 'alloy-id-';
    var idAttr = 'alloy-id';

    var write = function (label, elem) {
      var id = Id.generate(prefix + label);
      Attr.set(elem, idAttr, id);
      return id;
    };

    var read = function (elem) {
      var id = Node.isElement(elem) ? Attr.get(elem, idAttr) : null;
      return Option.from(id);
    };

    var find = function (container, id) {
      return SelectorFind.descendant(container, id);
    };

    return {
      write: write,
      read: read,
      find: find,
      attribute: Fun.constant(idAttr)
    };
  }
);