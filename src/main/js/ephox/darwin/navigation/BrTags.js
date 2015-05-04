define(
  'ephox.darwin.navigation.BrTags',

  [
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse'
  ],

  function (BeforeAfter, SelectionRange, Situ, Awareness, Fun, Option, Spot, DomGather, Node, Text, Traverse) {
    var isBr = function (elem) {
      return Node.name(elem) === 'br';
    };

    var gatherer = function (cand, gather, isRoot) {
      return gather(cand, isRoot).bind(function (target) {
        return Node.isText(target) && Text.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : Option.some(target);
      });
    };

    var locate = function (element) {
      return Traverse.parent(element).bind(function (parent) {
        return Traverse.findIndex(element).map(function (index) {
          return {
            parent: Fun.constant(parent),
            index: Fun.constant(index)
          };
        });
      });
    };

    var handleBr = function (isRoot, element, traverse, gather, relative) {
      // 1. Has a neighbouring sibling ... position relative to neighbouring element
      // 2. Has no neighbouring sibling ... position relative to gathered element
      return traverse(element).orThunk(function () {
        return gatherer(element, gather, isRoot);
      }).map(relative);
    };

    var findBr = function (element, offset) {
      return Traverse.child(element, offset).filter(isBr).orThunk(function () {
        // Can be either side of the br, and still be a br.
        return Traverse.child(element, offset-1).filter(isBr);
      });
    };

    var handleParent = function (isRoot, element, offset, traverse, gather, relative) {
      // 1. Has no neighbouring sibling, position relative to gathered element
      // 2. Has a neighbouring sibling, position at the neighbouring sibling with respect to parent
      return findBr(element, offset).bind(function (br) {
        console.log('br', br.dom());
        return traverse(br).fold(function () {
          return gatherer(br, gather, isRoot).map(relative);
        }, function (adjacent) {
          return locate(adjacent).map(function (info) {
            return Situ.on(info.parent(), info.index());
          });
        });
      });
    };


    var tryBr = function (win, isRoot, element, offset, traverse, gather, situ) {
      // Three different situations
      // 1. the br is the child, and it has a previous sibling. Use parent, index-1)
      // 2. the br is the child and it has no previous sibling, set to before the previous gather result
      // 3. the br is the element and it has a previous sibling, use parent index-1)
      // 4. the br is the element and it has no previous sibling, set to before the previous gather result.
      // 2. the element is the br itself,
      var target = isBr(element) ? handleBr(isRoot, element, traverse, gather, situ) : handleParent(isRoot, element, offset, traverse, gather, situ);
      return target.map(function (tgt) {
        return SelectionRange.write(tgt, tgt);
      });
    };

    var tryBrDown = function (win, isRoot, element, offset) {
      return tryBr(win, isRoot, element, offset, Traverse.nextSibling, DomGather.after, Situ.before);
    };

    var tryBrUp = function (win, isRoot, element, offset) {
      return tryBr(win, isRoot, element, offset, Traverse.prevSibling, DomGather.before, Situ.after);
    };

    var process = function (analysis) {
      return BeforeAfter.cata(analysis,
        function (message) {
          console.log('>> br.none => browser (' + message + ')');
          return Option.none('BR ADT: none');
        },
        function () {
          console.log('>> br.success => browser');
          return Option.none();
        },
        function (cell) {
          console.log('>> br.failedUp => box-hitting');
          return Option.some(Spot.point(cell, 0));
        },
        function (cell) {
          console.log('>> br.failedDown => box-hitting');
          return Option.some(Spot.point(cell, Awareness.getEnd(cell)));
        }
      );
    };

    return {
      tryBrDown: tryBrDown,
      tryBrUp: tryBrUp,
      process: process
    };
  }
);