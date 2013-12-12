define(
  'ephox.snooker.tbio.resize.Adjustments',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.activate.Water',
    'ephox.snooker.tbio.Aq',
    'ephox.snooker.tbio.query.Lookup',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css'
  ],

  function (Arr, Fun, Water, Aq, Lookup, Attr, Css) {
    var getInt = function (element, property) {
      return toInt(Css.get(element, property));
    };

    var toInt = function (value) {
      return parseInt(value, 10);
    };

    var widths = function (information) {
      var raw = Lookup.widths(information);
      return Arr.map(raw, toInt);
    };

    var heights = function (information) {
      var raw = Lookup.heights(information);
      return Arr.map(raw, toInt);
    };

    var adjustWidths = function (table, bar, column) {
      adjustDimension(table, bar, column, vertical);
    };

    var adjustHeights = function (table, bar, row) {
      adjustDimension(table, bar, row, horizontal);
    };

    var adjustDimension = function (table, bar, index, direction) {
      var old = Attr.get(bar, direction.data());
      var current = getInt(bar, direction.property());
      var delta = current - old;

      var information = Lookup.information(table);
      var values = direction.lookup(information);

      var adjustments = Water.water(values, index, delta, 10);
      var withAdjustment = Arr.map(adjustments, function (a, i) {
        return a + values[i];
      });

      var newValues = direction.adjuster(information, withAdjustment);
      Arr.each(newValues, function (v) {
        Css.set(v.id(), direction.style(), v[direction.style()]() + 'px');
      });

      var total = Arr.foldr(withAdjustment, function (b, a) { return b + a; }, 0);
      Css.set(table, direction.style(), total + 'px');

      Attr.remove(bar, direction.data());
    };

    var vertical = {
      data: Fun.constant('data-initial-left'),
      property: Fun.constant('left'),
      lookup: widths,
      adjuster: Aq.aq,
      style: Fun.constant('width')
    };

    var horizontal = {
      data: Fun.constant('data-initial-top'),
      property: Fun.constant('top'),
      lookup: heights,
      adjuster: Aq.qwe,
      style: Fun.constant('height')
    };

    return {
      adjustWidths: adjustWidths,
      adjustHeights: adjustHeights
    };
  }
);
