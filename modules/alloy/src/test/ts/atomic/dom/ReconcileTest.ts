import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { reconcileToDom } from 'ephox/alloy/dom/Reconcile';

describe('ReconcileTest', () => {
  const elementDefinition = {
    uid: 'uid-1',
    tag: '',
    attributes: {},
    classes: [],
    styles: {},
    value: Optional.from(undefined),
    innerHtml: Optional.from(undefined),
    domChildren: []
  };

  // TBA: test for updating styles and attributes
  it('TINY-8736: Override the value of element according to the definition', () => {
    const component = SugarElement.fromHtml<HTMLTextAreaElement>('<textarea></textarea>');
    const definition = {
      ...elementDefinition,
      value: Optional.from('abc')
    };
    const newDom = reconcileToDom(definition, component);
    assert.equal((newDom.dom as HTMLTextAreaElement).value, 'abc');
  });

  it('TINY-8736: Default the value of element to empty string if not defined in the definition', () => {
    const component = SugarElement.fromHtml<HTMLTextAreaElement>('<textarea>hi</textarea/>');
    const newDom = reconcileToDom(elementDefinition, component);
    assert.equal((newDom.dom as HTMLTextAreaElement).value, '');
  });

  it('TINY-8736: Should not update value of a non togglable element', () => {
    const component = SugarElement.fromHtml<HTMLDivElement>('<div>wow</div>');
    assert.isUndefined((component.dom as any).value);
    const newDom = reconcileToDom(elementDefinition, component);
    assert.isUndefined((newDom.dom as any).value);
  });
});
