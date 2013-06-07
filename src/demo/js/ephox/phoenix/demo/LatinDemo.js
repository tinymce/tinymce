define(
  'ephox.phoenix.demo.LatinDemo',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.phoenix.search.DomSearcher',
    'ephox.phoenix.wrap.DomWrapper',
    'ephox.phoenix.wrap.DomWraps',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Event',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Obj, DomSearcher, DomWrapper, DomWraps, Attr, Css, Element, Event, Insert, Text) {
    return function () {
      var text = Element.fromText('Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur');

      var p = Element.fromTag('p');
      Insert.append(p, text);

      var button = Element.fromTag('button');
      Attr.set(button, 'type', 'button');
      Insert.append(button, Element.fromText('New'));

      var underline = function () {
        var c = Element.fromTag('span');
        Css.set(c, 'text-decoration', 'underline');
        return DomWraps.basic(c);
      };

      var allWords = (function () {
        var duplicates = Text.get(text).split(/\W/);
        var set = {};
        Arr.each(duplicates, function (x) {
          if (x.length) set[x] = x;
        });

        return Obj.keys(set);
      })();

      Event.bind(button, 'click', function (event) {
        highlight(allWords, underline);
      });

      var highlight = function (words, nu) {
        var matches = DomSearcher.safeWords([p], words);
        Arr.each(matches, function (x) {
          DomWrapper.wrapper(x.elements(), nu);
        });
      };

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      Insert.append(ephoxUi, p);
      Insert.append(ephoxUi, button);
    };
  }
);
