define(
  'ephox.phoenix.demo.LatinDemo',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.phoenix.search.Matcher',
    'ephox.phoenix.search.Mogel',
    'ephox.phoenix.wrap.Wrapper',
    'ephox.phoenix.wrap.Wraps',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Event',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Obj, Matcher, Mogel, Wrapper, Wraps, Struct, Attr, Class, Css, Element, Event, Insert, Text) {
    return function () {
      var text = Element.fromText('Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur');

      var p = Element.fromTag('p');
      Insert.append(p, text);

      var button = Element.fromTag('button');
      Attr.set(button, 'type', 'button');
      Insert.append(button, Element.fromText('New'));

      var button2 = Element.fromTag('button');
      Attr.set(button2, 'type', 'button');
      Insert.append(button2, Element.fromText('Old'));

      var nu = function () {
        var c = Element.fromTag('span');
        Css.set(c, 'text-decoration', 'underline');
        return Wraps.basic(c);
      };

      var getWords = function () {
        var duplicates = Text.get(text).split(' ');
        var set = {};
        Arr.each(duplicates, function (x) {
          set[x] = x;
        });

        return Obj.keys(set);
      };

      Event.bind(button, 'click', function (event) {
        var words = getWords();
        highlightNew(words);
      });

      Event.bind(button2, 'click', function (event) {
        var words = getWords();
        highlightOld(words);
      });

      var highlightNew = function (words) {
        var mogel = Mogel.mogel([p], words);
        
        Arr.each(mogel, function (x) {
          Wrapper.wrapper(x.elements(), nu);
        });
      };

      var highlightOld = function (words) {
        var set = {};
        var matches = Arr.bind(words, function (x) {
          if (set[x]) return [];
          var safeX = x.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
          var wordMatches = Matcher.word([p], safeX);
          set[x] = wordMatches;
          return Arr.map(wordMatches, function (y) {
            return Struct.immutable('word', 'match')(x, y);
          });
        });

        Arr.each(matches, function (x) {
          var match = x.match().get();
          match.each(function (v) {
            Wrapper.wrapWith(v.begin().element(), v.begin().offset(), v.end().element(), v.end().offset(), nu);
          });
        });
      };

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      Insert.append(ephoxUi, p);
      Insert.append(ephoxUi, button);
      Insert.append(ephoxUi, button2);

    };
  }
);
