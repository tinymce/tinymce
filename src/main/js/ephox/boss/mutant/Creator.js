define(
  'ephox.boss.mutant.Creator',

  [
    'ephox.boss.api.TextGene',
    'ephox.highway.Merger'
  ],

  function (TextGene, Merger) {
    var nu = function (name) {
      return { id: 'nu_' + name, name: name };
    };

    var clone = function (item) {
      return Merger.merge({}, item, {
        children: []
      });
    };

    var text = function (value) {
      return TextGene('?_' + value, value);
    };

    return {
      nu: nu,
      clone: clone,
      text: text
    };
  }
);
