define(
  'ephox.boss.mutant.Properties',

  [
  ],

  function () {
    var children = function (item) {
      return item.children;
    };

    var name = function (item) {
      return item.name;
    };

    var parent = function (item) {
      return item.parent;
    };

    return {
      children: children,
      name: name,
      parent: parent
    };
  }
);
