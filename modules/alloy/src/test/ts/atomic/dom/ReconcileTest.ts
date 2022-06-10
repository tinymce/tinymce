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
  it('TINY-8736: Override value of element according to the definition', () => {
    const component = SugarElement.fromHtml<HTMLInputElement>('<textarea>1234</textarea>');
    const definition = {
      ...elementDefinition,
      value: Optional.from('abc')
    };
    const newDom = reconcileToDom(definition, component);
    assert.equal((newDom.dom as HTMLInputElement).value, 'abc');
  });

  it('TINY-8736: Default value of element to empty string if value is not specified in the definition', () => {
    const component = SugarElement.fromHtml<HTMLInputElement>('<textarea>hi</textarea/>');
    const newDom = reconcileToDom(elementDefinition, component);
    assert.equal((newDom.dom as HTMLInputElement).value, '');
  });

  it('TINY-8736: Default the modified value of element to empty string if value is not specified in the definition', () => {
    const component = SugarElement.fromHtml<HTMLTextAreaElement>('<textarea>How</textarea>');
    component.dom.value = 'hello';
    const newDom = reconcileToDom(elementDefinition, component);
    assert.equal((newDom.dom as HTMLTextAreaElement).value, '');
  });
});
