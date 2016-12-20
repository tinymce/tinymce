define(
  'ephox.sugar.api.dom.Insert',

  [
    'ephox.sugar.api.search.Traverse'
  ],

  function (Traverse) {
    var before = function (marker, element) {
      var parent = Traverse.parent(marker);
      parent.each(function (v) {
        v.dom().insertBefore(element.dom(), marker.dom());
      });
    };

    var after = function (marker, element) {
      var sibling = Traverse.nextSibling(marker);
      sibling.fold(function () {
        var parent = Traverse.parent(marker);
        parent.each(function (v) {
          append(v, element);
        });
      }, function (v) {
        before(v, element);
      });
    };

    var prepend = function (parent, element) {
      var firstChild = Traverse.firstChild(parent);
      firstChild.fold(function () {
        append(parent, element);
      }, function (v) {
        parent.dom().insertBefore(element.dom(), v.dom());
      });
    };

    var append = function (parent, element) {
      parent.dom().appendChild(element.dom());
    };

    var appendAt = function (parent, element, index) {
      Traverse.child(parent, index).fold(function () {
        append(parent, element);
      }, function (v) {
        before(v, element);
      });
    };

    var wrap = function (element, wrapper) {
      before(element, wrapper);
      append(wrapper, element);
    };

    return {
      before: before,
      after: after,
      prepend: prepend,
      append: append,
      appendAt: appendAt,
      wrap: wrap
    };
  }
);
