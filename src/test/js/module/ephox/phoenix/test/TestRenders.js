define(
  'ephox.phoenix.test.TestRenders',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var typeditem = function (a) {
      return a.fold(function (item) {
        return 'boundary(' + item.id + ')';
      }, function (item) {
        return 'empty(' + item.id + ')';
      }, function (item) {
        return 'text("' + item.text + '")';
      });
    };

    var ids = function (items) {
      return Arr.map(items, id);
    };

    var id = function (item) {
      return item.id;
    };

    var texts = function (items) {
      return Arr.map(items, text);
    };

    var text = function (item) {
      return item.text;
    };

    return {
      typeditem: typeditem,
      ids: ids,
      id: id,
      texts: texts,
      text: text
    };
  }
);
