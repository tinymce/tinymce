define(
  'ephox.phoenix.gather.HackSections',

  [

  ],

  function () {
    /*
     * Identification of sectors:
     *
     * - if we start on a text node, continue the gathering process and include entire node
     * - if we start on a boundary, stop the gathering process and do not include
     * - if we start on an empty tag, stop the gathering process and include.
     * - if we start on a node with children, run gather.left or gather.right over it. If all children
     *   are included, include just the parent.


    /*
     * Identification of words:
     *
     * - if we start on a text node, include it and advance in the appropriate direction
     * - if we don't start on a text node, advance but don't include the current node.
     *
     * For boundaries, stop the gathering process and do not include
     * For empty tags, stop the gathering process and do not include
     * For text nodes:
     *   a) text node has a character break, stop the gathering process and include partial
     *   b) text node has no character breaks, keep gathering and include entire node
     * For others, keep gathering and do not include
     */


// return universe.property().isEmptyTag(element) || universe.property().isBoundary(element);


    var sections = function (universe, item) {
      // var toLeft = doWords(universe, item, Hacksy.advance, Hacksy.left());
      // var toRight = doWords(universe, item, Hacksy.advance, Hacksy.right());
      // var middle = universe.property().isText(item) ? [ all(universe, item) ] : [];
      // return Arr.reverse(toLeft).concat(middle).concat(toRight);
      return [];
    };

    return {
      sections: sections
    };
  }
);
