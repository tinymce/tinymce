define(
  'ephox.phoenix.test.TestRenders',

  [
  ],

  function () {
    var typeditem = function (a) {
      return a.fold(function (item) {
        return 'boundary(' + item.id + ')';
      }, function (item) {
        return 'empty(' + item.id + ')';
      }, function (item) {
        return 'text("' + item.text + '")';
      });
    };

    return {
      typeditem: typeditem
    };
  }
);
