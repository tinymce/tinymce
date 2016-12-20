define(
  'ephox.sugar.api.dom.Replication',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Attr, Element, Insert, InsertAll, Remove, Traverse) {
    var clone = function (original, deep) {
      return Element.fromDom(original.dom().cloneNode(deep));
    };

    /** Shallow clone - just the tag, no children */
    var shallow = function (original) {
      return clone(original, false);
    };

    /** Deep clone - everything copied including children */
    var deep = function (original) {
      return clone(original, true);
    };

    /** Shallow clone, with a new tag */
    var shallowAs = function (original, tag) {
      var nu = Element.fromTag(tag);

      var attributes = Attr.clone(original);
      Attr.setAll(nu, attributes);

      return nu;
    };

    /** Deep clone, with a new tag */
    var copy = function (original, tag) {
      var nu = shallowAs(original, tag);

      // NOTE
      // previously this used serialisation:
      // nu.dom().innerHTML = original.dom().innerHTML;
      //
      // Clone should be equivalent (and faster), but if TD <-> TH toggle breaks, put it back.

      var cloneChildren = Traverse.children(deep(original));
      InsertAll.append(nu, cloneChildren);

      return nu;
    };

    /** Change the tag name, but keep all children */
    var mutate = function (original, tag) {
      var nu = shallowAs(original, tag);

      Insert.before(original, nu);
      var children = Traverse.children(original);
      InsertAll.append(nu, children);
      Remove.remove(original);
      return nu;
    };

    return {
      shallow: shallow,
      shallowAs: shallowAs,
      deep: deep,
      copy: copy,
      mutate: mutate
    };
  }
);
