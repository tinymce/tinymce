define(
  'ephox.robin.zone.ZoneWalker',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.api.general.ZonePosition',
    'ephox.robin.util.Trampoline',
    'ephox.robin.zone.LanguageZones',
    'ephox.scullion.ADT'
  ],

  function (Option, Gather, ZonePosition, Trampoline, LanguageZones, Adt) {
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
      return function () {
        return outcome.fold(
          function (aItem, aMode, aLang) {
            // inline(aItem, aMode, aLang)
            var opening = aMode === Gather.advance;
            (opening ? stack.openInline : stack.closeInline)(aLang, aItem);
            return doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);

          }, function (aItem, aMode) {
            var detail = transform(universe, aItem);
            // text (aItem, aMode)
            stack.addDetail(detail);
            return (! stopOn(aItem, aMode)) ? doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport) : Trampoline.stop();
          }, function (aItem, aMode) {
            // empty (aItem, aMode)
            stack.addEmpty(aItem);
            return doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);
                  
          }, function (aItem, aMode, aLang) {
            // Use boundary positions to assess whether we have moved out of the viewport.
            var position = viewport.assess(aItem);
            return ZonePosition.cata(position,
              function (aboveBlock) {
                // Only sidestep if we hadn't already tried it. Otherwise, we'll loop forever.
                if (aMode !== Gather.backtrack) return doWalk(universe, aItem, Gather.sidestep, stopOn, stack, transform, viewport);
                else return Trampoline.stop();
              }, function (inBlock) {
                var opening = aMode === Gather.advance;
                (opening ? stack.openBoundary : stack.closeBoundary)(aLang, aItem);
                return doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);
              }, function (belowBlock) {
                return Trampoline.stop();
                // abort.
                // console.log('Aborting', belowBlock.dom());
              }
            );
          }, function (aItem, aMode) {
            return Trampoline.stop();
            // concluded(aItem, aMode) DO NOTHING
          }
        );
      };
    };

    // I'm going to trampoline this: (http://stackoverflow.com/questions/25228871/how-to-understand-trampoline-in-javascript)
    // The reason is because we often hit stack problems with this code, so this is an attempt to resolve them.
    // The key thing is that you need to keep returning a function.
    var doWalk = function (universe, current, mode, stopOn, stack, transform, viewport) {
      var outcome = takeStep(universe, current, mode, stopOn);
      return process(universe, outcome, stopOn, stack, transform, viewport);
    };

    var walk = function (universe, start, finish, defaultLang, transform, viewport) {
      var stopOn = function (sItem, sMode) {
        return universe.eq(sItem, finish) && (sMode !== Gather.advance || universe.property().isText(sItem) || universe.property().children(sItem).length === 0);
      };

      // INVESTIGATE: Make the language zone stack immutable *and* performant
      var stack = LanguageZones.nu(defaultLang);
      var mode = Gather.advance;
      var initial = analyse(universe, start, mode, stopOn);

      Trampoline.run(function () {
        return process(universe, initial, stopOn, stack, transform, viewport);
      });

      return stack.done();
    };

    return {
      walk: walk
    };
  }
);