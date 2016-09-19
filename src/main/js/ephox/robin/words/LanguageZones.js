define(
  'ephox.robin.words.LanguageZones',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Fun, Option) {
    // Maybe try and make immutable ... if it is still performant.

    return function (defaultLang) {
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
        // console.log('Open inline', elem.dom().cloneNode(true), stack);
      };

      var closeInline = function (optLang, elem) {
        pop(optLang);
        // console.log('Close inline', elem.dom().cloneNode(true), stack);
      };

      var addText = function (elem) {
        zone.push(elem);
        // console.log('text', elem.dom().cloneNode(true), stack);
      };

      var addEmpty = function (empty) {
        var lang = getLang(Option.none());
        spawn(lang);
        // console.log('empty', empty.dom().cloneNode(true));
      };  

      var openBoundary = function (optLang, elem) {
        push(optLang);
        var lang = getLang(optLang);
        spawn(lang);
        // console.log('Open boundary', elem.dom().cloneNode(true), stack);
      };

      var closeBoundary = function (optLang, elem) {
        pop(optLang);
        var lang = getLang(optLang);
        spawn(lang);
        // console.log('Close boundary', elem.dom().cloneNode(true), stack);
      };

      var done = function () {
        if (zone.length > 0) {
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
  }
);