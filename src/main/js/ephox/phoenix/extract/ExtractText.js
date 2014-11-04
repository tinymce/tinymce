define(
  'ephox.phoenix.extract.ExtractText',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.extract.Extract'
  ],

  function (Arr, Fun, Extract) {
    var newline = '\n';
    var space = ' ';

    var onEmpty = function (item, universe) {
      return universe.property().name(item) === 'img' ? space : newline;
    };
      
    var from = function (universe, item) {
      console.log('item: ', item.dom());
      var typed = Extract.typed(universe, item);
      console.log('typed: ', typed.length);
      return Arr.map(typed, function (t) {
        return t.fold(Fun.constant(newline), onEmpty, universe.property().getText);
      }).join('');
    };

    return {
      from: from
    };
  }
);