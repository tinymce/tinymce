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

    /* Obviously, we can't support full selector syntax ... so let's just split by comma and use as array to compare with name */
    // Selector support, either:
    // 'name,name,...' : comma-list of names
    // '[attr]'        : attribute name
    var is = function (item, selector) {
      return Option.from(selector.match(ATTR_REGEX)).fold(function () { // not [attr], assume list of names
        var matches = selector.split(',');
        return Arr.contains(matches, item.name);
      }, function (attrMatch) { // matched [attr]
        return Attribution.get(item, attrMatch[1]);
      });
    };

    return {
      eq: eq,
      is: is
    };
  }
);
