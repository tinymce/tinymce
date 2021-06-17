import { Arr, Obj, Optional } from '@ephox/katamari';
import { Attribute, Css, DomEvent, Insert, SugarElement, SugarText } from '@ephox/sugar';

import { Wrapter } from 'ephox/phoenix/api/data/Types';
import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';

// eslint-disable-next-line max-len
const text = SugarElement.fromText('Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur');

const p = SugarElement.fromTag('p');
Insert.append(p, text);

const button = SugarElement.fromTag('button');
Attribute.set(button, 'type', 'button');
Insert.append(button, SugarElement.fromText('New'));

const underline = () => {
  const c = SugarElement.fromTag('span');
  Css.set(c, 'text-decoration', 'underline');
  return DomWrapping.nu(c);
};

const allWords = (() => {
  const duplicates = SugarText.get(text).split(/\W/);
  const set: Record<string, string> = {};
  Arr.each(duplicates, (x) => {
    if (x.length) {
      set[x] = x;
    }
  });

  return Obj.keys(set);
})();

DomEvent.bind(button, 'click', (_event) => {
  highlight(allWords, underline);
});

const highlight = (words: string[], nu: () => Wrapter<SugarElement>) => {
  const matches = DomSearch.safeWords([ p ], words);
  Arr.each(matches, (x) => {
    DomWrapping.wrapper(x.elements, nu);
  });
};

const ephoxUi = SugarElement.fromDom(Optional.from(document.getElementById('ephox-ui')).getOrDie('No element with id "ephox-id"'));
Insert.append(ephoxUi, p);
Insert.append(ephoxUi, button);
