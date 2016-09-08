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
      var tagMatch = function () {
        var matches = selector.split(',');
        return Arr.contains(matches, item.name);
      };
      var attrMatch = function (match) {
        return (Attribution.get(item, match[1]) !== undefined);
      };
      return Option.from(selector.match(ATTR_REGEX)).fold(tagMatch, attrMatch);
    };

    return {
      eq: eq,
      is: is
    };
  }
);
