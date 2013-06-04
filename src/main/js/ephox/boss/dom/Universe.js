define(
  'ephox.boss.dom.Universe',

  [
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.PredicateFind',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Compare, Css, Element, Insert, InsertAll, Node, PredicateFind, Remove, SelectorFind, Traverse) {
    return {
      up: {
        selector: SelectorFind.ancestor,
        predicate: PredicateFind.ancestor,
        all: Traverse.parents
      },
      down: {
        selector: SelectorFind.descendants
      },
      styles: {
        get: Css.get,
        set: Css.set,
        remove: Css.remove
      },
      insert: {
        before: Insert.before,
        after: Insert.after,
        append: Insert.append,
        appendAll: InsertAll.append,
        prepend: Insert.prepend,
        wrap: Insert.wrap
      },
      remove: {
        unwrap: Remove.unwrap
      },
      create: {
        nu: Element.fromTag
      },
      property: {
        children: Traverse.children,
        name: Node.name,
        parent: Traverse.parent
      },
      eq: Compare.eq
    };
  }
);
