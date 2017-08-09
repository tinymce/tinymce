define(
  'ephox.snooker.api.TableProperties',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct',
    'ephox.snooker.api.ResizeDirection',
    'ephox.snooker.api.Sizes',
    'ephox.syrup.api.Attr',
    'ephox.syrup.api.Css',
    'ephox.syrup.api.Element',
    'ephox.syrup.api.Float',
    'ephox.syrup.api.Html',
    'ephox.syrup.api.Insert',
    'ephox.syrup.api.Remove',
    'ephox.syrup.api.SelectorFind'
  ],

  function (Fun, Option, Struct, ResizeDirection, Sizes, Attr, Css, Element, Float, Html, Insert, Remove, SelectorFind) {
    var properties = Struct.immutableBag([ 'floatval', 'caption', 'summary', 'border', 'dimensions' ], [ ]);

    var floats = {
      left: { 'float': 'left', margin: '' },
      right: { 'float': 'right', margin: '' },
      none: { 'float': 'none', margin: '' },
      center: { 'float': '', margin: '0 auto' }
    };

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

    var setFloat = function (table) {
      var styles = Option.from(floats[type]);
      styles.each(function (css) {
        Css.setAll(table, css);
        Css.setAll(table, extra);
      });
    };
    
    var apply = function (table, props) {
      props.floatval().each(function (fl) {
        setFloat(table, fl);
      });

      props.border().each(function (border) {
        Attr.set(table, 'border', border);
      });

      if (props.summary() === '') Attr.remove(table, 'summary');
      else setSummary(table, props.summary());

      if (props.caption() === '') SelectorFind.child(table, 'caption').each(Remove.remove);
      else setCaption(table, props.caption());

      setDimensions(table, props.dimensions());
    };
    
    var divineBorder = function (table) {
      var border = Attr.get(table, 'border');
      return (border === '0' || border === '1') ? Option.some(border) : Option.none();
    };

    var divineDimensions = function (table) {
      var width = Css.getRaw(table, 'width');
      var height = Css.getRaw(table, 'height');
      return {
        width: Fun.constant(width),
        height: Fun.constant(height)
      };
    };

    var divine = function (filterOption, table) {
      var floatValue = Float.divine(table);
      var summary = Attr.get(table, 'summary');
      var caption = SelectorFind.child(table, 'caption').map(function (caption) {
        var html = Html.get(caption);
        return filterOption.fold(function () {
          return html;
        }, function (filter) {
          return filter.filterHtml(filter.output(), html);
        });
      }).getOr('');
      var border = divineBorder(table);
      var dimensions = divineDimensions(table);
      return properties({
        floatval: floatValue,
        caption: caption,
        summary: summary,
        border: border,
        dimensions: dimensions
      });
    };

    return {
      apply: apply,
      divine: divine,
      properties: properties,
      setCaption: setCaption,
      setSummary: setSummary,
      setDimensions: setDimensions,
    };
  }
);
