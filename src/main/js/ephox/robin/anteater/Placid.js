define(
  'ephox.robin.anteater.Placid',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Split',
    'ephox.robin.anteater.Anteater',
    'ephox.scullion.ADT'
  ],

  function (Option, Split, Anteater, ADT) {
    var adt = ADT.generate([
      { left: [ 'element' ] },
      { between: [ 'before', 'after' ] },
      { right: [ 'element' ] },
    ]);

    var onText = function (universe, element, offset) {
      var raw = Split.split(universe, element, offset);
      var positions = Split.position(universe, raw);
      return positions.fold(function () {
        return adt.left(element);
      }, function (e) {
        return adt.right(element);
      }, function (b, a) {
        return adt.between(b, a);
      }, function (e) {
        return adt.left(e);
      });
    };

    var onElement = function (universe, element, offset) {
      var children = universe.property().children(element);
      if (offset === 0) return adt.right(element);
      else if (offset === children.length) return adt.left(element);
      else if (offset > 0 && offset < children.length) return adt.between(children[offset - 1], children[offset]);
      else return adt.left(element);
    };

    var analyse = function (universe, element, offset) {
      var handler = universe.property().isText(element) ? onText : onElement;
      return handler(universe, element, offset);
    };

    var lake = function (universe, isRoot, element, soffset, foffset) {
      var middle = Split.splitByPair(universe, element, soffset, foffset);
      return Option.some([ middle ]);
    };


    // TODO: Handle backwards selections !
    var placid = function (universe, isRoot, start, soffset, finish, foffset) {
      if (universe.property().isText(start) && universe.eq(start, finish)) return lake(universe, isRoot, start, soffset, foffset);
      var leftSide = analyse(universe, start, soffset).fold(function (l) {
        return l;
        // really not sure what to do here.
      }, function (b, a) {
        return a;
      }, function (r) {
        return r;
      });

      var rightSide = analyse(universe, finish, foffset).fold(function (l) {
        return l;
      }, function (b, a) {
        return b;
      }, function (r) {
        // really not sure what to do here.
        return r;
      });

      console.log('leftSide: ', leftSide.dom(), 'rightSide: ', rightSide.dom());

      return Anteater.fossil(universe, isRoot, leftSide, rightSide);
      // If we are starting on a text node, we need to split the text node first, and break from the split text node.
      // If we are starting on an element at the left edge, start from the first element if left or none if right.
    };

    return {
      placid: placid
    };
  }
);