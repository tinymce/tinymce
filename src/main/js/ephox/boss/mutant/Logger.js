define(
  'ephox.boss.mutant.Logger',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var basic = function (item) {
      return custom(item, function (i) {
        return i.id;
      });
    };

    var custom = function (item, renderer) {
      return item.children && item.children.length > 0 ?
          renderer(item) + '(' + Arr.map(item.children || [], function (c) {
            return custom(c, renderer);
          }).join(',') + ')'
          : renderer(item);
    };

    return {
      basic: basic,
      custom: custom
    };
  }
);
