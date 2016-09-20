define(
  'ephox.robin.test.ZoneObjects',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.compass.Arr',
    'ephox.robin.words.LanguageZones',
    'ephox.wrap.Jsc'
  ],

  function (Logger, RawAssertions, Arr, LanguageZones, Jsc) {
    var raw = function (universe, zones) {
      return Arr.map(zones, function (zone) {
        return {
          lang: zone.lang(),
          elements: Arr.map(zone.elements(), function (elem) { return elem.id; }),
          words: Arr.map(zone.words(), function (w) { return w.word(); })
        };
      });
    };

    var assertZones = function (label, universe, expected, zones) {
      var rawActual = raw(universe, zones);
      RawAssertions.assertEq(label + '\nChecking zones: ', expected, rawActual);
    };

    var checkProps = function (label, universe, textIds, start, zones) {
      
      Arr.each(zones, function (zone) {
        var elements = zone.elements();
        if (elements.length === 0) return;
        
        var first = elements[0];
        // Check languages all match the zone language
        Arr.each(elements, function (x, i) {
          RawAssertions.assertEq(
            'Checking everything in ' + label + ' has same language',
            LanguageZones.getDefault(universe, x).getOr('none'), zone.lang().getOr('none')
          );
          RawAssertions.assertEq(
            'Check that everything in the ' + label + ' is a text node',
            true,
            universe.property().isText(x)
          );
        });

        Arr.each(elements, function (x, i) {
          if (i > 0) {
            var prev = elements[i - 1].id;
            var current = x.item().id;
            RawAssertions.assertEq(
              'The text nodes should be one after the other',
              +1,
              Arr.indexOf(textIds, current) - Arr.indexOf(textIds, prev)
            );
          }
        });

        var blockParent = universe.up().predicate(first, universe.property().isBoundary).getOrDie('No block parent tag found');
        Arr.each(elements, function (x, i) {
          RawAssertions.assertEq(
            'All block ancestor tags should be the same as the original',
            blockParent,
            universe.up().predicate(x.item(), universe.property().isBoundary).getOrDie('No block parent tag found')
          );
        });
      });
    };

    var propertyTest = function (label, universe, x) {
      Logger.sync(
        label,
        function () {
          var getIds = function (item, predicate) {
            var rest = Arr.bind(item.children || [ ], function (id) { return getIds(id, predicate); });
            var self = predicate(item) ? [ item.id ] : [ ];
            return self.concat(rest);
          };

          var textIds = getIds(universe.get(), universe.property().isText);

          var arbTextIds = Jsc.elements(textIds);

          Jsc.property(
            label + ': Checking that text nodes have consistent zones',
            arbTextIds,
            function (startId) {
              if (startId === 'root') return true;
              var start = universe.find(universe.get(), startId).getOrDie();
              if (universe.property().isBoundary(start)) return true;
              var actual = Clustering.words(universe, start, Fun.constant(false));
              checkProps(universe, textIds, start, actual);
              return true;
            }
          );
        }
      );
    };

    return {
      raw: raw,
      assertZones: assertZones
    };
  }
);