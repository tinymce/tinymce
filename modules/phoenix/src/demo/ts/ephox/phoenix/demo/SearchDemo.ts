import { Arr, Optional } from '@ephox/katamari';
import { Attribute, Class, Css, DomEvent, Insert, InsertAll, SugarElement, Value } from '@ephox/sugar';

import { SearchResult } from 'ephox/phoenix/api/data/Types';
import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';

const container = SugarElement.fromTag('div');

const contentHtml = `<div>
<p>This is the first paragraph<\/p>
<p>This is the second paragraph<\/p>
<p>The third paragraph is <span>significantly <span>more tricky<\/span> than the other stuff \twas twas<\/span>.
<table>
<thead>
<tr>
<th>Column 1<\/th>
<th>Column 2<\/th>
<\/tr>
<\/thead>
<tbody>
<tr>
<td>Value 1<\/td>
<td>Value 2<\/td>
<\/tr>
<\/tbody>
<\/table>
<\/div>`;

const content = SugarElement.fromHtml(contentHtml);
const input = SugarElement.fromTag('input');
const button = SugarElement.fromTag('button');
Insert.append(button, SugarElement.fromText('Highlight token'));
Attribute.set(button, 'type', 'input');

const buttonWord = SugarElement.fromTag('button');
Attribute.set(buttonWord, 'type', 'input');
Insert.append(buttonWord, SugarElement.fromText('Highlight word'));

const wrapper = () => {
  const c = SugarElement.fromTag('span');
  Class.add(c, 'highlighted');
  Css.set(c, 'background-color', '#cadbee');
  return DomWrapping.nu(c);
};

DomEvent.bind(button, 'click', (_event) => {
  const token = Value.get(input);
  if (token.length > 0) {
    const matches = DomSearch.safeToken([ content ], token);
    highlight(matches);
  }
});

DomEvent.bind(buttonWord, 'click', (_event) => {
  const word = Value.get(input);
  if (word.length > 0) {
    const matches = DomSearch.safeWords([ content ], [ word ]);
    highlight(matches);
  }
});

const highlight = (matches: SearchResult<SugarElement>[]) => {
  Arr.each(matches, (x) => {
    DomWrapping.wrapper(x.elements, wrapper);
  });
};

InsertAll.append(container, [ input, button, buttonWord, content ]);

const ephoxUi = SugarElement.fromDom(Optional.from(document.getElementById('ephox-ui')).getOrDie('No element with id "ephox-id"'));
Insert.append(ephoxUi, container);
