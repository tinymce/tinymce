define(
  'ephox.boss.mutant.Creator',

  [
    'ephox.boss.api.TextGene',
    'ephox.highway.Merger',
    'global!Math'
  ],

  function (TextGene, Merger, Math) {
    var isNu = function (item) {
      return item.id === 'nu_' + item.name || item.id === '?_' + item.text;
    };

    var seed = function () {
      return {
        random: Math.random()
      };
    };

    var nu = function (name) {
      return Merger.merge(
        { id: 'nu_' + name, name: name },
        seed()
      );
    };

    var clone = function (item) {
      return Merger.merge({}, item, {
        children: [],
        id: 'clone**<' + item.id + '>'
      });
    };

    var text = function (value) {
      return Merger.merge(
        TextGene('?_' + value, value),
        seed()
      );
    };

    return {
      nu: nu,
      clone: clone,
      text: text,
      isNu: isNu
    };
  }
);
