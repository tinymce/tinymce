define(
  'ephox.dragster.util.Sizers',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Visibility',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Fun, Css, Element, Height, InsertAll, Location, Remove, SelectorFind, Visibility, Width) {
    return function (target) {
      var box = function () {
        var r = Element.fromTag('div');
        Width.set(r, 8);
        Height.set(r, 8);
        Css.set(r, 'position', 'absolute');
        Css.set(r, 'border', '1px solid gray');

        var set = function (x, y) {
          Css.set(r, 'left', (x - 4) + 'px');
          Css.set(r, 'top', (y - 4) + 'px');
        };

        var destroy = function () {
          Remove.remove(r);
        };

        var hider = Visibility.displayToggler(r, 'block');

        return {
          element: Fun.constant(r),
          show: hider.off,
          hide: hider.on,
          set: set,
          destroy: destroy
        };
      };

      var northwest = box();
      var north = box();
      var northeast = box();

      var update = function () {
        var loc = Location.absolute(target);
        var w = Width.get(target);
        var h = Height.get(target);
        var minx = loc.left();
        var maxx = loc.left() + w ;
        var midx = loc.left() + w/2 ;

        var y = loc.top();

        northwest.set(minx, y);
        north.set(midx, y);
        northeast.set(maxx, y);

        var body = SelectorFind.first('body');
        body.each(function (b) {
          InsertAll.append(b, [ northwest.element(), north.element(), northeast.element() ]);
        });
      };

      var hide = function () {
        Arr.each([ northwest, north, northeast ], function (x) {
          x.hide();
        });
      };

      var show = function () {
        Arr.each([ northwest, north, northeast ], function (x) {
          x.show();
        });
      };

      var destroy = function () {
        northwest.destroy();
        north.destroy();
        northeast.destroy();
      };

      return {
        northeast: Fun.constant(northeast),
        hide: hide,
        show: show,
        update: update,
        destroy: destroy
      };
    };

  }
);
