define(
  'ephox.phoenix.gather.Traversal',

  [
    'ephox.phoenix.gather.Iterator',
    'ephox.phoenix.gather.Siblings'
  ],

  function (Iterator, Siblings) {
    var left = function () {
      return {
        iter: Iterator.rtl,
        siblings: Siblings.left
      };
    };

    var right = function () {
      return {
        iter: Iterator.ltr,
        siblings: Siblings.right
      };
    };

    return {
      left: left,
      right: right
    };
  }
);
