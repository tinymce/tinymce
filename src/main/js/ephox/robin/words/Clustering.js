define(
  'ephox.robin.words.Clustering',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.words.ClusterSearch',
    'ephox.robin.words.WordDecision',
    'ephox.robin.zone.LanguageZones'
  ],

  function (Arr, Fun, Option, ClusterSearch, WordDecision, LanguageZones) {
    var byBoundary = function (universe, item) {
      var isCustomBoundary = Fun.constant(false);
      // TODO: Remote optimise parameter.
      var toLeft = ClusterSearch.creepLeft(universe, item, isCustomBoundary);
      var toRight = ClusterSearch.creepRight(universe, item, isCustomBoundary);

      var isMiddleEmpty = function () {
        return ClusterSearch.isEmpty(universe, item);
      };

      var leftEdge = toLeft.length > 0 ? toLeft[toLeft.length - 1].item() : item;
      var rightEdge = toRight.length > 0 ? toRight[toRight.length - 1].item() : item;

      var isEmpty = leftEdge.length === 0 && toRight.length === 0 && isMiddleEmpty();

      return {
        left: Fun.constant(leftEdge),
        right: Fun.constant(rightEdge),
        isEmpty: Fun.constant(isEmpty)
      };
    };

    // Return the anyLang to the left and right of item, and as well as the any text nodes inside the item itself, and the language of item.
    var byLanguage = function (universe, item, _optimise) {
      // TODO: Remote optimise parameter.
      var lang = LanguageZones.getDefault(universe, item); // closest language anywhere up the DOM ancestor path including self
      var isLanguageBoundary = function (universe, item) {
        var itemLang = LanguageZones.getDefault(universe, item);
        // console.log('itemLang', itemLang.getOr('none'), 'currentLang', lang.getOr('none'));
        return !Option.equals(lang, itemLang);
      };

      var toLeft = ClusterSearch.creepLeft(universe, item, isLanguageBoundary);
      var toRight = ClusterSearch.creepRight(universe, item, isLanguageBoundary);
      var middle =  [ WordDecision.detail(universe, item) ];

      var all = Arr.reverse(toLeft).concat(middle).concat(toRight);

      return {
        all: Fun.constant(all),
        left: Fun.constant(toLeft),
        middle: Fun.constant(middle),
        right: Fun.constant(toRight),
        lang: Fun.constant(lang)
      };
    };

    return {
      byBoundary: byBoundary,
      byLanguage: byLanguage
    };
  }
);