import { document } from '@ephox/dom-globals';
import { Arr, Obj, Option } from '@ephox/katamari';
import { Attr, Css, DomEvent, Element, Insert, Text } from '@ephox/sugar';
import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';
import { Wrapter } from 'ephox/phoenix/api/data/Types';

const text = Element.fromText('Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur');

const p = Element.fromTag('p');
Insert.append(p, text);

const button = Element.fromTag('button');
Attr.set(button, 'type', 'button');
Insert.append(button, Element.fromText('New'));

const underline = function () {
  const c = Element.fromTag('span');
  Css.set(c, 'text-decoration', 'underline');
  return DomWrapping.nu(c);
};

const allWords = (function () {
  const duplicates = Text.get(text).split(/\W/);
  const set: Record<string, string> = {};
  Arr.each(duplicates, function (x) {
    if (x.length) set[x] = x;
  });

  return Obj.keys(set);
})();

DomEvent.bind(button, 'click', function (event) {
  highlight(allWords, underline);
});

const highlight = function (words: string[], nu: () => Wrapter<Element>) {
  const matches = DomSearch.safeWords([p], words);
  Arr.each(matches, function (x) {
    DomWrapping.wrapper(x.elements(), nu);
  });
};

const ephoxUi = Element.fromDom(Option.from(document.getElementById('ephox-ui')).getOrDie('No element with id "ephox-id"'));
Insert.append(ephoxUi, p);
Insert.append(ephoxUi, button);
