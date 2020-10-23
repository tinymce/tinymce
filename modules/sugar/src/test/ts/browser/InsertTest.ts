import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Class from 'ephox/sugar/api/properties/Class';
import * as Classes from 'ephox/sugar/api/properties/Classes';
import * as Html from 'ephox/sugar/api/properties/Html';
import Div from 'ephox/sugar/test/Div';
import EphoxElement from 'ephox/sugar/test/EphoxElement';

UnitTest.test('InsertTest', () => {
  const container = Div();
  const span = EphoxElement('span');
  const ol = EphoxElement('ol');
  const li1 = EphoxElement('li');
  const li2 = EphoxElement('li');
  const li3 = EphoxElement('li');
  const li4 = EphoxElement('li');
  const li0 = EphoxElement('li');
  Classes.add(li2, [ 'second', 'third' ]);
  Class.add(li3, 'l3');
  Class.add(li4, 'l4');
  Class.add(li0, 'l0');
  const p = EphoxElement('p');
  const p2 = EphoxElement('p');

  Insert.append(container, p);
  Insert.append(container, p2);
  Insert.append(p, span);
  assert.eq('<p><span></span></p><p></p>', Html.get(container));

  Insert.before(p, ol);
  assert.eq('<ol></ol><p><span></span></p><p></p>', Html.get(container));

  Insert.append(ol, li1);
  Insert.after(li1, li2);
  Insert.after(li2, li4);

  assert.eq('<ol><li></li><li class="second third"></li><li class="l4"></li></ol><p><span></span></p><p></p>', Html.get(container));

  Insert.before(li4, li3);

  assert.eq('<ol><li></li><li class="second third"></li><li class="l3"></li><li class="l4"></li></ol><p><span></span></p><p></p>', Html.get(container));

  Insert.prepend(ol, li0);

  assert.eq('<ol><li class="l0"></li><li></li><li class="second third"></li><li class="l3"></li><li class="l4"></li></ol><p><span></span></p><p></p>', Html.get(container));
});
