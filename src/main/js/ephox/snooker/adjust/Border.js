define(
  'ephox.snooker.adjust.Border',

  [
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse',
    'ephox.sugar.api.Width'
  ],

  function (Styles, Classes, Css, Element, Height, Insert, Remove, Traverse, Width) {
    var nu = function () {
      var border = Element.fromTag('div');
      Classes.add(border, [ Styles.resolve('adjust-border')]);

      var element = function () {
        return border;
      };

      var surround = function (target) {
        Remove.empty(border);
        Insert.append(border, target);
        var width = Width.getOuter(target);
        var height = Height.getOuter(target);

        // ASSUMPTION: Border is 1px wide.
        Css.setAll(border, {
          // width: width - 2 ,
          // height: height - 2
        });
      };

      var subject = function () {
        return Traverse.firstChild(border);
      };

      return {
        element: element,
        subject: subject,
        surround: surround
      };
    };

    return {
      nu: nu
    };
  }
);
