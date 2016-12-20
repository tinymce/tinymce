define(
  'ephox.sugar.api.dom.Loader',

  [
    'ephox.highway.Merger',
    'ephox.knoch.future.CachedFuture',
    'ephox.perhaps.Result',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'global!document'
  ],

  function (Merger, CachedFuture, Result, Attr, DomEvent, Element, Insert, Remove, document) {
    return function (context) {
      var head = Element.fromDom(document.head);

      var script = function (url, _id) {
        var extra = _id ? _id : {};
        return CachedFuture.nu(function (callback) {
          var tag = Element.fromTag('script');
          var attrs = Merger.merge({
            type: 'text/javascript',
            async: 'async',
            src: url
          }, extra);

          var error = DomEvent.bind(tag, 'error', function () {
            unbind();
            callback(Result.error('Error loading external script tag ' + url));
          });

          var load = DomEvent.bind(tag, 'load', function (event) {
            unbind();
            callback(Result.value(event.target()));
          });

          var unbind = function () {
            error.unbind();
            load.unbind();
          };

          Insert.append(head, tag);
          Attr.setAll(tag, attrs);
        });
      };

      var inline = function (text) {
        var tag = Element.fromTag('script');
        Attr.set(tag, 'type', 'text/javascript');
        Insert.append(tag, Element.fromText(text));
        Insert.append(head, tag);
        Remove.remove(tag);
      };

      return {
        inline: inline,
        script: script
      };
    };
  }
);
