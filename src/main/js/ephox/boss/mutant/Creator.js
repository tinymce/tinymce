define(
  'ephox.boss.mutant.Creator',

  [
    'ephox.highway.Merger'
  ],

  function (Merger) {
    var nu = function (name) {
      return { id: 'nu_' + name, name: name };
    };

    var clone = function (item) {
      return Merger.merge({}, item, {
        children: []
      });
    };

    return {
      nu: nu,
      clone: clone
    };
  }
);
