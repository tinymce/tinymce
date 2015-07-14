define(
  'ephox.echo.api.AriaVoice',

  [
    'ephox.epithet.Id',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse',
    'global!setTimeout'
  ],

  function (Id, Fun, Attr, Css, Element, Insert, Remove, Traverse, setTimeout) {
    var offscreen = {
      position: 'absolute',
      left: '-9999px'
    };

    var tokenSelector = function () {
      return 'span[id^="ephox-echo-voice"]';
    };

    var create = function (doc, text) {
      var span = Element.fromTag('span', doc.dom());
      // This stops it saying other things (possibly blank) between transitions.
      var contents = Element.fromText(text, doc.dom());
      Insert.append(span, contents);
      return span;
    };

    var describe = function (item, description) {
      var doc = Traverse.owner(item);
      var token = create(doc, description);
      var id = Id.generate('ephox-echo-voice');
      Attr.set(token, 'id', id);

      // We may not be able to get rid of them, so we'll make them display: none;
      Css.set(token, 'display', 'none');

      // Although described-by does not appear to work in IE10, we are currently only supporting JAWS in Firefox (and IE11), 
      // and this does work for those browsers.
      Attr.set(item, 'aria-describedby', id);
      return token;
    };

    var base = function (getAttrs, parent, text) {
      var doc = Traverse.owner(parent);
      
      var token = create(doc, text);

      // Make it speak as soon as it is in the DOM (politely)
      Attr.setAll(token, getAttrs());

      Css.setAll(token, offscreen);

      Insert.append(parent, token);

      // Remove the token later.
      setTimeout(function () {
        Remove.remove(token);
      }, 1000);
    };

    var speak = Fun.curry(base, function (text) {
      return {
        // Make it speak as soon as it is in the DOM (politely)
        'aria-live': 'polite',
        'aria-atomic': 'true',
        'aria-label': text
      };
    });

    var shout = Fun.curry(base, Fun.constant({
      // Don't put aria-label in alerts. It will read it twice on JAWS+Firefox.
      'aria-live': 'assertive',
      'aria-atomic': 'true',
      'role': 'alert'
    }));

    return {
      describe: describe,
      speak: speak,
      shout: shout,
      tokenSelector: tokenSelector
    };
  }
);