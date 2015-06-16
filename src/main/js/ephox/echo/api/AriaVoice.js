define(
  'ephox.echo.api.AriaVoice',

  [
    'ephox.epithet.Id',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Id, Attr, Body, Css, Element, Insert) {
    var describe = function (item, description) {
      var token = Element.fromTag('span');
      var text = Element.fromText(description);
      Insert.append(token, text);
      var id = Id.generate('ephox-echo-voice');
      Attr.set(token, 'id', id);

      // We may not be able to get rid of them, so we'll make them display: none;
      Css.set(token, 'display', 'none');

      // Although described-by does not appear to work in IE10, we are currently only supporting JAWS in Firefox (and IE11), 
      // and this does work for those browsers.
      Attr.set(item, 'aria-describedby', id);
      Insert.append(Body.body(), token);
    };

    return {
      describe: describe
    };
  }
);