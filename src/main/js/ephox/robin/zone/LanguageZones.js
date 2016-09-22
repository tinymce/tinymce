define(
  'ephox.robin.zone.LanguageZones',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Fun, Option) {
    var nu = function (defaultLang) {
      var stack = [ ];

      var zones = [ ];

      var zone = [ ];
      var zoneLang = defaultLang;

      var push = function (optLang) {
        optLang.each(function (l) {
          stack.push(l);
        });
      };

      var pop = function (optLang) {
        optLang.each(function (l) {
          stack = stack.slice(0, stack.length - 1);
        });
      };

      var topOfStack = function () {
        return Option.from(stack[stack.length - 1]);
      };

      var spawn = function (newLang) {
        if (zone.length > 0) {
          zones.push({
            lang: Fun.constant(zoneLang),
            elements: Fun.constant(zone)
          });
        }
        zone = [ ];
        zoneLang = newLang;
      };

      var getLang = function (optLang) {
        return optLang.or(topOfStack()).getOr(defaultLang);
      };

      var openInline = function (optLang, elem) {
        var lang = getLang(optLang);
        // If the inline tag being opened is different from the current top of the stack,
        // then we don't want to create a new zone.
        if (lang !== zoneLang) spawn(lang);
        push(optLang);
      };

      var closeInline = function (optLang, elem) {
        pop(optLang);
      };

      var addText = function (elem) {
        var lang = getLang(Option.none());
        // If the top of the stack is not the same as zoneLang, then we need to spawn again.
        if (lang !== zoneLang) spawn(lang);
        zone.push(elem);
      };

      var addEmpty = function (empty) {
        var lang = getLang(Option.none());
        spawn(lang);
      };  

      var openBoundary = function (optLang, elem) {
        push(optLang);
        var lang = getLang(optLang);
        spawn(lang);
      };

      var closeBoundary = function (optLang, elem) {
        pop(optLang);
        var lang = getLang(optLang);
        spawn(lang);
      };

      var done = function () {
        if (zone.length > 0) {
          // Intentionally, not a zone because we don't have words yet.
          zones.push({
            lang: Fun.constant(zoneLang),
            elements: Fun.constant(zone)
          });
        }
        return zones.slice(0);
      };

      return {
        openInline: openInline,
        closeInline: closeInline,
        addText: addText,
        addEmpty: addEmpty,
        openBoundary: openBoundary,
        closeBoundary: closeBoundary,
        done: done
      };
    };

    // Returns: Option(string) of the LANG attribute of the closest ancestor element or None.
    //  - uses Fun.constant(false) for isRoot parameter to search even the top HTML element
    //    (regardless of 'classic'/iframe or 'inline'/div mode).
    // Note: there may be descendant elements with a different language
    var getDefault = function (universe, item) {
      return universe.up().closest(item, '[lang]', Fun.constant(false)).map(function (el) {
        return universe.attrs().get(el, 'lang');
      });
    };

    // Horrible name.
    var strictBounds = function (envLang, onlyLang) {
      return function (universe, item) {
        var itemLang = getDefault(universe, item).getOr(envLang);
        var r = onlyLang !== itemLang;
        return r;
      };
    };

    var getBounder = function (optLang) {
      return function (universe, item) {
        var itemLang = getDefault(universe, item);
        return !Option.equals(optLang, itemLang);
      };
    };

    return {
      nu: nu,
      getDefault: getDefault,
      getBounder: getBounder,
      strictBounds: strictBounds
    };
  }
);