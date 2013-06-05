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

    var isText = function (item) {
      return item.name === 'TEXT_GENE';
    };

    var isElement = function (item) {
      return item.name !== undefined && item.name !== 'TEXT_GENE';
    };

    var getText = function (item) {
      return item.text;
    };

    var setText = function (item, value) {
      item.text = value;
    };

    return {
      children: children,
      name: name,
      parent: parent,
      isText: isText,
      isElement: isElement,
      getText: getText,
      setText: setText
    };
  }
);
