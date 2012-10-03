define(
  'ephox.sugar.api.Traverse',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Arr, Option) {
    var all = ['root', 'a', 'b', 'c', 'd', 'aa', 'ab', 'ba', 'ca', 'cb', 'cc', 'caa', 'caaa', 'cca', 'aaa', 'aab', 'aac', 'aba', 'abb'];

    var validate = function (element) {
      if (!Arr.contains(all, element)) throw 'Invalid element: ' + element;
    };

    var parent = function (element) {
      validate(element);
      if (element === 'root') return Option.none();
      else if (element.length === 1) return Option.some('root');
      else return Option.some(element.substring(0, element.length - 1));
    };

    var children = function (element) {
      validate(element);
      if (element === 'root') {
        return Arr.filter(all, function (x) { return x.length === 1; });
      } else {
        return Arr.filter(all, function (x) {
          return x.length === element.length + 1 && element === x.substring(0, x.length - 1);
        });
      }
    };

    return {
      parent: parent,
      children: children
    };
  }
);
