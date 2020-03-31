import { document } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Attr, Class, Css, DomEvent, Element, Insert, InsertAll, Value } from '@ephox/sugar';
import * as DomSearch from 'ephox/phoenix/api/dom/DomSearch';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';
import { SearchResult } from 'ephox/phoenix/api/data/Types';

const container = Element.fromTag('div');

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

const content = Element.fromHtml(contentHtml);
const input = Element.fromTag('input');
const button = Element.fromTag('button');
Insert.append(button, Element.fromText('Highlight token'));
Attr.set(button, 'type', 'input');

const buttonWord = Element.fromTag('button');
Attr.set(buttonWord, 'type', 'input');
Insert.append(buttonWord, Element.fromText('Highlight word'));

const wrapper = function () {
  const c = Element.fromTag('span');
  Class.add(c, 'highlighted');
  Css.set(c, 'background-color', '#cadbee');
  return DomWrapping.nu(c);
};

DomEvent.bind(button, 'click', function (_event) {
  const token = Value.get(input);
  if (token.length > 0) {
    const matches = DomSearch.safeToken([ content ], token);
    highlight(matches);
  }
});

DomEvent.bind(buttonWord, 'click', function (_event) {
  const word = Value.get(input);
  if (word.length > 0) {
    const matches = DomSearch.safeWords([ content ], [ word ]);
    highlight(matches);
  }
});

const highlight = function (matches: SearchResult<Element>[]) {
  Arr.each(matches, function (x) {
    DomWrapping.wrapper(x.elements(), wrapper);
  });
};

InsertAll.append(container, [ input, button, buttonWord, content ]);

const ephoxUi = Element.fromDom(Option.from(document.getElementById('ephox-ui')).getOrDie('No element with id "ephox-id"'));
Insert.append(ephoxUi, container);
