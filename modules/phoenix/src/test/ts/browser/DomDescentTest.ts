import { assert, UnitTest } from '@ephox/bedrock';
import { Obj } from '@ephox/katamari';
import { Element, Hierarchy } from '@ephox/sugar';
import { SpotPoint } from 'ephox/phoenix/api/data/Types';
import * as DomDescent from 'ephox/phoenix/api/dom/DomDescent';

UnitTest.test('DomDescentTest', function () {

  const root = Element.fromHtml(
    '<div>\n' +
    '<p>This <span>first</span> thing I do</p>' +
    '<table>\n  <tbody>\n  <tr>\n  <td>Hi</td>\n  </tr>\n  </tbody>\n  </table>\n' +
    '</div>'
  );

  const toRef = function (v: number[], k: string) {
    return {
      element: Hierarchy.follow(root, v).getOrDie('Could not find path: ' + v + ' for key: ' + k),
      path: v
    };
  };

  const refs = Obj.map({
    'div': [],
    'p': [1],
    'span': [1].concat([1]),
    'first': [1, 1].concat([0]),
    'table': [2],
    'td': [2, 1, 1, 1],
    'tdtext': [2, 1, 1, 1, 0]
  }, toRef);

  interface CheckItem {
    path: number[];
    offset: number;
  }

  const check = function (expected: CheckItem, actual: SpotPoint<Element>) {
    const aPath = Hierarchy.path(root, actual.element()).getOrDie('Could not extract path');
    assert.eq(expected.path, aPath);
    assert.eq(expected.offset, actual.offset());
  };

  // Descending into div should take you to first whitspace node.
  check({ path: [0], offset: 0 }, DomDescent.toLeaf(refs.div.element, 0));
  // Descending into last offset of div should take you to last whitespace node.
  check({ path: [3], offset: 0 }, DomDescent.toLeaf(refs.div.element, 3));

  // But freefalling into div should take you to first paragraph text.
  check({ path: [1, 0], offset: 0 }, DomDescent.freefallLtr(refs.div.element));
  // But freefalling (RTL) into div should take you to the end of last cell
  check({ path: refs.tdtext.path, offset: 'Hi'.length }, DomDescent.freefallRtl(refs.div.element));
  // Frefalling into the table should take you to the start of the first cell
  check({ path: refs.tdtext.path, offset: ''.length }, DomDescent.freefallLtr(refs.table.element));
});