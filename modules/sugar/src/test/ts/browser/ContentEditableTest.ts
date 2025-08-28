import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import * as ContentEditable from 'ephox/sugar/api/properties/ContentEditable';
import Div from 'ephox/sugar/test/Div';

describe('ContentEditableTest', () => {
  const makeNonEditable = (element: SugarElement<HTMLElement>) => Attribute.set(element, 'contenteditable', 'false');
  const makeEditable = (element: SugarElement<HTMLElement>) => Attribute.set(element, 'contenteditable', 'true');

  it('get - detached element', () => {
    const div = Div();
    const parent = Div();
    Insert.append(parent, div);
    assert.isFalse(ContentEditable.get(div));
    makeEditable(parent);
    assert.isTrue(ContentEditable.get(div));
    makeNonEditable(div);
    assert.isFalse(ContentEditable.get(div));
    makeEditable(div);
    assert.isTrue(ContentEditable.get(div));
  });

  it('get - attached element', () => {
    const div = Div();
    const parent = Div();
    Insert.append(parent, div);
    Insert.append(SugarBody.body(), parent);
    makeEditable(parent);

    assert.isTrue(ContentEditable.get(div));
    makeNonEditable(parent);
    assert.isFalse(ContentEditable.get(div));
    makeEditable(div);
    assert.isTrue(ContentEditable.get(div));
    makeNonEditable(div);
    assert.isFalse(ContentEditable.get(div));

    Remove.remove(parent);
  });

  it('getRaw', () => {
    const div = Div();
    assert.equal(ContentEditable.getRaw(div), 'inherit');
    makeNonEditable(div);
    assert.equal(ContentEditable.getRaw(div), 'false');
    makeEditable(div);
    assert.equal(ContentEditable.getRaw(div), 'true');
  });

  it('set', () => {
    const div = Div();
    assert.isFalse(Attribute.has(div, 'contenteditable'));
    ContentEditable.set(div, true);
    assert.equal(Attribute.get(div, 'contenteditable'), 'true');
    ContentEditable.set(div, false);
    assert.equal(Attribute.get(div, 'contenteditable'), 'false');
  });

  it('isEditable', () => {
    const div = Div();
    const parent = Div();
    Insert.append(parent, div);

    // Detached fallbacks
    assert.isFalse(ContentEditable.isEditable(div, false));
    assert.isTrue(ContentEditable.isEditable(div, true));

    // Once attached fallbacks should make no difference
    Insert.append(SugarBody.body(), parent);
    assert.isFalse(ContentEditable.isEditable(div, false));
    assert.isFalse(ContentEditable.isEditable(div, true));

    // Sanity check once editable
    makeEditable(parent);
    assert.isTrue(ContentEditable.isEditable(div, false));
    assert.isTrue(ContentEditable.isEditable(div, true));

    Remove.remove(parent);
  });
});
