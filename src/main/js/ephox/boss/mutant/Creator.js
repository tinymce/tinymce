define(
  'ephox.boss.mutant.Creator',

  [
  ],

  function () {
    var nu = function (name) {
      return { id: 'nu_' + name, name: name };
    };

    return {
      nu: nu
    };
  }
);
