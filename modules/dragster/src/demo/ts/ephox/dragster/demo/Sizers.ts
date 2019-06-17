import { Arr, Fun } from '@ephox/katamari';
import { Css, Element, Height, InsertAll, Location, Remove, SelectorFind, Visibility, Width } from '@ephox/sugar';

export default function () {
  const box = function () {
    const r = Element.fromTag('div');
    Width.set(r, 8);
    Height.set(r, 8);
    Css.set(r, 'position', 'absolute');
    Css.set(r, 'border', '1px solid gray');
    Css.set(r, 'z-index', '1000');

    const set = function (x: number, y: number) {
      Css.set(r, 'left', (x - 4) + 'px');
      Css.set(r, 'top', (y - 4) + 'px');
    };

    const destroy = function () {
      Remove.remove(r);
    };

    const hider = Visibility.displayToggler(r, 'block');

    return {
      element: Fun.constant(r),
      show: hider.off,
      hide: hider.on,
      set,
      destroy
    };
  };

  const northwest = box();
  const north = box();
  const northeast = box();
  const southeast = box();
  Css.set(southeast.element(), 'cursor', 'se-resize');

  const update = function (target: Element) {
    const loc = Location.viewport(target);
    const w = Width.get(target);
    const h = Height.get(target);
    const minx = loc.left();
    const maxx = loc.left() + w ;
    const midx = loc.left() + w / 2;

    const y = loc.top();
    const maxy = y + h;

    northwest.set(minx, y);
    north.set(midx, y);
    northeast.set(maxx, y);
    southeast.set(maxx, maxy);

    const body = SelectorFind.first('body');
    body.each(function (b) {
      InsertAll.append(b, [ southeast.element() ]);
    });
  };

  const hide = function () {
    Arr.each([ northwest, north, northeast, southeast ], function (x) {
      x.hide();
    });
  };

  const show = function () {
    Arr.each([ northwest, north, northeast, southeast ], function (x) {
      x.show();
    });
  };

  const destroy = function () {
    northwest.destroy();
    north.destroy();
    northeast.destroy();
    southeast.destroy();
  };

  return {
    northeast: Fun.constant(northeast),
    southeast: Fun.constant(southeast),
    hide,
    show,
    update,
    destroy
  };
}