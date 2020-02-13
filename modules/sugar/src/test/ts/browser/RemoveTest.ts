import * as Body from 'ephox/sugar/api/node/Body';
import * as Class from 'ephox/sugar/api/properties/Class';
import * as Classes from 'ephox/sugar/api/properties/Classes';
import Element from 'ephox/sugar/api/node/Element';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import Div from 'ephox/sugar/test/Div';
import EphoxElement from 'ephox/sugar/test/EphoxElement';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('RemoveTest', function () {
  const runChecks = function (connected) {
    const container = Div();
    const span = EphoxElement('span');
    const ol = EphoxElement('ol');
    const li1 = EphoxElement('li');
    const li2 = EphoxElement('li');
    const li3 = EphoxElement('li');
    const li4 = EphoxElement('li');
    const li0 = EphoxElement('li');
    Classes.add(li2, ['second', 'third']);
    Class.add(li3, 'l3');
    Class.add(li4, 'l4');
    Class.add(li0, 'l0');
    const p = EphoxElement('p');
    const p2 = EphoxElement('p');

    Insert.append(container, p);
    Insert.append(container, p2);
    Insert.append(p, span);

    if (connected) { Insert.append(Body.body(), container); }

    assert.eq('<p><span></span></p><p></p>', Html.get(container));
    Remove.remove(p2);
    assert.eq('<p><span></span></p>', Html.get(container));
    Insert.append(container, p2);
    assert.eq('<p><span></span></p><p></p>', Html.get(container));
    Remove.remove(span);
    assert.eq('<p></p><p></p>', Html.get(container));
    Remove.empty(container);

    // regular empty check
    assert.eq('', Html.get(container));
    assert.eq(0, Traverse.children(container).length);

    // after inserting an empty text node, empty doesn't always mean empty!
    Insert.append(container, Element.fromText(''));
    Remove.empty(container);
    assert.eq('', Html.get(container));
    assert.eq(0, Traverse.children(container).length);

    Remove.remove(container);
  };

  runChecks(false);
  runChecks(true);
});
