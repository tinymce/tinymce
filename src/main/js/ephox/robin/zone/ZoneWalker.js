define(
  'ephox.robin.zone.ZoneWalker',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.api.general.ZonePosition',
    'ephox.robin.zone.LanguageZones',
    'ephox.scullion.ADT'
  ],

  function (Option, Gather, ZonePosition, LanguageZones, Adt) {
    var adt = Adt.generate([
      // an inline element, so use the lang to identify if a new zone is needed
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

    var analyse = function (universe, item, mode, stopOn) {
      // Find if the current item has a lang property on it.
      var currentLang = universe.property().isElement(item) ? Option.from(universe.attrs().get(item, 'lang')) : Option.none();

      if (universe.property().isText(item)) return adt.text(item, mode);
      else if (stopOn(item, mode)) return adt.concluded(item, mode);
      else if (universe.property().isBoundary(item)) return adt.boundary(item, mode, currentLang);

      else if (universe.property().isEmptyTag(item)) return adt.empty(item, mode);
      
      else return adt.inline(item, mode, currentLang);
    };

    var takeStep = function (universe, item, mode, stopOn) {
      return Gather.walk(universe, item, mode, Gather.walkers().right(), _rules).fold(function () {
        return adt.concluded(item, mode);
      }, function (n) {
        return analyse(universe, n.item(), n.mode(), stopOn);
      });  
    };

    var process = function (universe, outcome, stopOn, stack, transform, viewport) {
      outcome.fold(
        function (aItem, aMode, aLang) {
          // inline(aItem, aMode, aLang)
          var opening = aMode === Gather.advance;
          (opening ? stack.openInline : stack.closeInline)(aLang, aItem);
          doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);

        }, function (aItem, aMode) {
          var detail = transform(universe, aItem);
          // text (aItem, aMode)
          stack.addDetail(detail);
          if (! stopOn(aItem, aMode)) doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);
        }, function (aItem, aMode) {
          // empty (aItem, aMode)
          stack.addEmpty(aItem);
          doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);
                
        }, function (aItem, aMode, aLang) {
          // Use boundary positions to assess whether we have moved out of the viewport.
          var position = viewport.assess(aItem);
          ZonePosition.cata(position,
            function (aboveBlock) {
              // Only sidestep if we hadn't already tried it. Otherwise, we'll loop forever.
              if (aMode !== Gather.backtrack) doWalk(universe, aItem, Gather.sidestep, stopOn, stack, transform, viewport);
            }, function (inBlock) {
              var opening = aMode === Gather.advance;
              (opening ? stack.openBoundary : stack.closeBoundary)(aLang, aItem);
              doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);
            }, function (belowBlock) {
              // abort.
              console.log('Aborting', belowBlock.dom());
            }
          );
        }, function (aItem, aMode) {
          // concluded(aItem, aMode) DO NOTHING
        }
      );
    };

    var doWalk = function (universe, current, mode, stopOn, stack, transform, viewport) {
      var outcome = takeStep(universe, current, mode, stopOn);
      process(universe, outcome, stopOn, stack, transform, viewport);
    };

    var walk = function (universe, start, finish, defaultLang, transform, viewport) {
      var stopOn = function (sItem, sMode) {
        return universe.eq(sItem, finish) && (sMode !== Gather.advance || universe.property().isText(sItem) || universe.property().children(sItem).length === 0);
      };

      // INVESTIGATE: Make the language zone stack immutable *and* performant
      var stack = LanguageZones.nu(defaultLang);
      var mode = Gather.advance;
      var initial = analyse(universe, start, mode, stopOn);
      process(universe, initial, stopOn, stack, transform, viewport);


      return stack.done();
    };

    return {
      walk: walk
    };
  }
);