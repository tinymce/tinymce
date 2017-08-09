define(
  'ephox.snooker.api.TableProperties',

  [
    'ephox.snooker.api.ResizeDirection',
    'ephox.snooker.api.Sizes',
    'ephox.syrup.api.Attr',
    'ephox.syrup.api.Element',
    'ephox.syrup.api.Html',
    'ephox.syrup.api.Insert',
    'ephox.syrup.api.Remove',
    'ephox.syrup.api.SelectorFind'
  ],

  function (ResizeDirection, Sizes, Attr, Element, Html, Insert, Remove, SelectorFind) {
    var setCaption = function (table, capt) {
      var caption = SelectorFind.child(table, 'caption').fold(function () {
        return Element.fromTag('caption');
      }, function (caption) {
        Remove.empty(caption);
        return caption;
      });
      Html.set(caption, capt);
      Insert.prepend(table, caption);
    };

    var setSummary = function (table, summary) {
      Attr.set(table, 'summary', summary);
    };

    var setDimensions = function (table, dimensions) {
      Sizes.redistribute(table, dimensions.width(), dimensions.height(), divineResizeDirection(table));
    };

    var divineResizeDirection = function (table) {
      return Attr.get(table, 'dir') === 'rtl' ? ResizeDirection.rtl : ResizeDirection.ltr;
    };

    return {
      setCaption: setCaption,
      setSummary: setSummary,
      setDimensions: setDimensions,
    };
  }
);
