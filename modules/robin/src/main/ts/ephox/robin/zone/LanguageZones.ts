import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

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

  var pushZone = function () {
    if (zone.length > 0) {
      // Intentionally, not a zone. These are details
      zones.push({
        lang: Fun.constant(zoneLang),
        details: Fun.constant(zone)
      });
    }
  };

  var spawn = function (newLang) {
    pushZone();
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

  var addDetail = function (detail) {
    var lang = getLang(Option.none());
    // If the top of the stack is not the same as zoneLang, then we need to spawn again.
    if (lang !== zoneLang) spawn(lang);
    zone.push(detail);
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
    pushZone();
    return zones.slice(0);
  };

  return {
    openInline: openInline,
    closeInline: closeInline,
    addDetail: addDetail,
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
var calculate = function (universe, item) {
  return universe.up().closest(item, '[lang]', Fun.constant(false)).map(function (el) {
    return universe.attrs().get(el, 'lang');
  });
};

var strictBounder = function (envLang, onlyLang) {
  return function (universe, item) {
    var itemLang = calculate(universe, item).getOr(envLang);
    var r = onlyLang !== itemLang;
    return r;
  };
};

var softBounder = function (optLang) {
  return function (universe, item) {
    var itemLang = calculate(universe, item);
    return !optLang.equals(itemLang);
  };
};

export default <any> {
  nu: nu,
  calculate: calculate,
  softBounder: softBounder,
  strictBounder: strictBounder
};