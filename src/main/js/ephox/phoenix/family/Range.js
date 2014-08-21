define(
  'ephox.phoenix.family.Range',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Extract',
    'ephox.phoenix.family.Parents',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Option, Extract, Parents, Node, Traverse) {
    var index = function (universe, items, item) {
      return Arr.findIndex(items, Fun.curry(universe.eq, item));
    };

    var order = function (items, a, delta1, b, delta2) {
      return a < b ? items.slice(a + delta1, b + delta2) : items.slice(b + delta2, a + delta1);
    };

    /**
     * Returns a flat array of text nodes between two defined nodes.
     *
     * Deltas are a broken concept. They control whether the item passed is included in the result.
     */




    var range = function (universe, item1, delta1, item2, delta2) {

    var piggy = function (element, tag) {
      return Traverse.prevSibling(element).bind(function (left) {
        return Traverse.nextSibling(element).map(function (right) {
          var me = Node.name(element);
          var l = Node.name(element);
          var r = Node.name(element);
          console.log(l, me, r, tag);

          return Array(l, me , r );
        });
      });
    };

    var magic = function (el) {
e = el
      console.log(el.dom())

p = piggy(el, 'td')
console.log(p.isSome());


      if(el.dom().nodeValue !== null) {
        console.log(el.dom().nodeValue.charCodeAt(0))

        var enter = el.dom().nodeValue.charCodeAt(0);
console.log(enter)
        // if(enter === 13) return false
      }

// if(el.dom().nodeType === 3) {debugger}

      // Option.from(Node.isText(el)).map(function () {
      //   return Option.some(Node.value(el).charCodeAt(0)).forAll(function () {

      //   });

      // }).getOr(false);

      // return Node.isText(el) && el.dom().nodeType !== 3 ? true : false;

      // return universe.property().isText(el);

      if(Node.isText(el) && Node.value(el).charCodeAt(0) !== 13) {
        return true;
      } else {
        return false;
      }
    };

      if (universe.eq(item1, item2)) return [item1];

      return Parents.common(universe, item1, item2).fold(function () {
        return []; // no common parent, therefore no intervening path. How does this clash with Path in robin?
      }, function (parent) {
        var items = [ parent ].concat(Extract.all(universe, parent));
        var start = index(universe, items, item1);
        var finish = index(universe, items, item2);
        var result = start > -1 && finish > -1 ? order(items, start, delta1, finish, delta2) : [];
        return Arr.filter(result, magic);
      });
    };

    return {
      range: range
    };

  }
);
