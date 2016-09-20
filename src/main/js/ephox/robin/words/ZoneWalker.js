define(
  'ephox.robin.words.ZoneWalker',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.words.LanguageZones',
    'ephox.robin.words.WordWalking',
    'ephox.scullion.ADT'
  ],

  function (Option, Gather, LanguageZones, WordWalking, Adt) {
    var adt = Adt.generate([
      // keep going and
      { inline: [ 'item', 'mode', 'lang' ] },
      { text: [ 'item', 'mode' ] },
      // things like <img>, <br>
      { empty: [ 'item', 'mode' ] },
      // things like boundary tags
      { boundary: [ 'item', 'mode', 'lang' ] },
      // hit the starting tag
      { concluded: [ 'item', 'mode' ]}
    ]);
      
      
    var _rules = undefined;

    var takeStep = function (universe, item, mode, stopOn) {
      // console.log('aItem', aItem.dom());
      return Gather.walk(universe, item, mode, Gather.walkers().right(), _rules).fold(function () {
        // console.log('concluding', aItem.dom());
        return adt.concluded(item, mode);
      }, function (n) {
        // Find if the current item has a lang property on it.
        var currentLang = universe.property().isElement(n.item()) ? Option.from(universe.attrs().get(n.item(), 'lang')) : Option.none();
  
        if (universe.property().isText(n.item())) return adt.text(n.item(), n.mode());
        else if (stopOn(n)) return adt.concluded(n.item(), n.mode());
        else if (universe.property().isBoundary(n.item())) return adt.boundary(n.item(), n.mode(), currentLang);

        else if (universe.property().isEmptyTag(n.item())) return adt.empty(n.item(), n.mode());
        
        else return adt.inline(n.item(), n.mode(), currentLang);
      });  
    };    

    var doWalk = function (universe, current, mode, finish, stack) {
      var stopOn = function (n) {
        return (universe.eq(n.item(), finish) && n.mode() !== Gather.advance);
      };

      var outcome = takeStep(universe, current, mode, stopOn);

      outcome.fold(function (aItem, aMode, aLang) {
        // inline(aItem, aMode, aLang)
        var opening = aMode === Gather.advance;
        (opening ? stack.openInline : stack.closeInline)(aLang, aItem);
        doWalk(universe, aItem, aMode, finish, stack);

      }, function (aItem, aMode) {
        // text (aItem, aMode)
        stack.addText(aItem);
        if (! universe.eq(aItem, finish)) doWalk(universe, aItem, aMode, finish, stack);
      }, function (aItem, aMode) {
        // empty (aItem, aMode)
        stack.addEmpty(aItem);
        doWalk(universe, aItem, aMode, finish, stack);
              
      }, function (aItem, aMode, aLang) {
        // boundary(aItem, aMode, aLang) 
        var opening = aMode === Gather.advance;
        (opening ? stack.openBoundary : stack.closeBoundary)(aLang, aItem);
        doWalk(universe, aItem, aMode, finish, stack);
      }, function (aItem, aMode) {
        // concluded(aItem, aMode)
        // DO NOTHING.
      });
    };

    var walk = function (universe, start, finish, defaultLang) {
      // TODO: Make the language zone stack immutable *and* performant
      var stack = LanguageZones(defaultLang);
      doWalk(universe, start, Gather.advance, finish, stack);
      return stack.done();
    };

    var expandTo = function (universe, current, mode, defaultLang) {

    };

    var expand = function (universe, centre, defaultLang) {
      var toLeft = expandTo(universe, centre, Gather.sidestep, WordWalking.left, defaultLang);
      var toRight = expandTo(universe, centre, Gather.sidestep, WordWalking.right, defaultLang);


    };

    return {
      walk: walk,
      expand: expand
    };
  }
);