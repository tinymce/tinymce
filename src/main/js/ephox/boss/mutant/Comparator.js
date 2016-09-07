define(
  'ephox.boss.mutant.Comparator',

  [
    'ephox.boss.mutant.Attribution',
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Attribution, Arr, Option) {

    var ATTR_REGEX = /^\[(.*)\]$/;

    var eq = function (a, b) {
      return a.id === undefined && b.id === undefined ? a.name === b.name : a.id === b.id;
    };

    // Obviously, we can't support full selector syntax, so ...
    // Selector support, either:
    // 'name,name,...' : comma-list of names to compare against item name
    // '[attr]'        : single attribute 'attr' key present in item attrs
    var is = function (item, selector) {
      return Option.from(selector.match(ATTR_REGEX)).fold(function () { // not [attr], assume list of names
        var matches = selector.split(',');
        return Arr.contains(matches, item.name);
      }, function (attrMatch) { // [attr], check value not undefined
        return (Attribution.get(item, attrMatch[1]) !== undefined);
      });
    };

    return {
      eq: eq,
      is: is
    };
  }
);
