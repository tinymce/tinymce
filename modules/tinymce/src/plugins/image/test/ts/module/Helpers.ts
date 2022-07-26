import { Assertions, Mouse, UiFinder } from '@ephox/agar';
import { Obj, Optional, Type } from '@ephox/katamari';
import { Attribute, Checked, Class, Focus, SugarBody, SugarElement, Traverse, Value } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

export interface ImageDialogData {
  src: {
    value: string;
  };
  alt: string;
  title: string;
  decorative: boolean;
  dimensions: {
    width: string;
    height: string;
  };
  caption: boolean;
  class: string;
  border: string;
  hspace: string;
  vspace: string;
  borderstyle: string;
}

export const generalTabSelectors = {
  src: 'label.tox-label:contains("Source") + div.tox-form__controls-h-stack div.tox-control-wrap input.tox-textfield',
  title: 'label.tox-label:contains("Image title") + input.tox-textfield',
  alt: 'label.tox-label:contains("Alternative description") + input.tox-textfield',
  width: 'div.tox-form__controls-h-stack div label:contains("Width") + input.tox-textfield',
  height: 'div.tox-form__controls-h-stack div label:contains("Height") + input.tox-textfield',
  caption: 'label.tox-label:contains("Caption") + label input.tox-checkbox__input',
  class: 'label.tox-label:contains("Class") + div.tox-listboxfield > .tox-listbox',
  images: 'label.tox-label:contains("Image list") + div.tox-listboxfield > .tox-listbox',
  decorative: 'label.tox-label:contains("Accessibility") + label.tox-checkbox>input'
};

export const advancedTabSelectors = {
  border: 'label.tox-label:contains("Border width") + input.tox-textfield',
  hspace: 'label.tox-label:contains("Horizontal space") + input.tox-textfield',
  vspace: 'label.tox-label:contains("Vertical space") + input.tox-textfield',
  borderstyle: 'label.tox-label:contains("Border style") + div.tox-listboxfield > .tox-listbox'
};

const isObjWithValue = (value: ImageDialogData[keyof ImageDialogData]): value is { value: string } =>
  Type.isObject(value) && Obj.has(value as Record<string, any>, 'value');

const gotoAdvancedTab = (): void => {
  const tab = UiFinder.findIn(SugarBody.body(), 'div.tox-tab:contains(Advanced)').getOrDie();
  Mouse.click(tab);
};

const setFieldValue = (selector: string, value: string | boolean): SugarElement<HTMLElement> => {
  const element = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), selector).getOrDie();
  Focus.focus(element);
  if (element.dom.type === 'checkbox' && Type.isBoolean(value)) {
    Checked.set(element, value);
  } else if (Class.has(element, 'tox-listbox')) {
    Attribute.set(element, 'data-value', value);
  } else {
    Value.set(element, String(value));
  }
  return element;
};

const setTabFieldValues = (data: Partial<ImageDialogData>, tabSelectors: Record<string, string>): void => {
  Obj.each(tabSelectors, (value, key) => {
    Obj.get(data, key as keyof Omit<ImageDialogData, 'dimensions'>)
      .orThunk(() => Obj.has(data, 'dimensions') ? Obj.get(data.dimensions as Record<string, string>, key) : Optional.none())
      .each((obj) => {
        const newValue = isObjWithValue(obj) ? obj.value : obj;
        setFieldValue(tabSelectors[key], newValue);
      });
  });
};

const fillActiveDialog = (data: Partial<ImageDialogData>, hasAdvanced = false): void => {
  setTabFieldValues(data, generalTabSelectors);
  if (hasAdvanced) {
    gotoAdvancedTab();
    setTabFieldValues(data, advancedTabSelectors);
  }
};

const fakeEvent = (elm: SugarElement<Node>, name: string): void => {
  const evt = document.createEvent('HTMLEvents');
  evt.initEvent(name, true, true);
  elm.dom.dispatchEvent(evt);
};

const setInputValue = (selector: string, value: string): SugarElement<HTMLElement> => {
  const field = setFieldValue(selector, value);
  fakeEvent(field, 'input');
  return field;
};

const setSelectValue = (selector: string, value: string): SugarElement<HTMLElement> => {
  const field = setFieldValue(selector, value);
  fakeEvent(field, 'change');
  return field;
};

const cleanHtml = (html: string): string =>
  html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');

const assertCleanHtml = (label: string, editor: Editor, expected: string): void =>
  Assertions.assertHtml(label, expected, cleanHtml(editor.getContent()));

const assertInputValue = (selector: string, expected: string): void => {
  const element = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), selector).getOrDie();
  const value = Value.get(element);
  assert.equal(value, expected, `input value should be ${expected}`);
};

const assertInputCheckbox = (selector: string, expectedState: boolean): void => {
  const element = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), selector).getOrDie();
  const value = Checked.get(element);
  assert.equal(value, expectedState, `input value should be ${expectedState}`);
};

const pSetListBoxItem = async (selector: string, itemText: string): Promise<void> => {
  const listBox = UiFinder.findIn(SugarBody.body(), selector).getOrDie();
  Mouse.click(listBox);
  await UiFinder.pWaitForVisible('Wait for list to open', SugarBody.body(), '.tox-menu.tox-collection--list');
  const item = UiFinder.findIn(SugarBody.body(), '.tox-collection__item-label:contains(' + itemText + ')').getOrDie();
  const itemParent = Traverse.parent(item).getOrDie('Failed to find list box item parent');
  Mouse.click(itemParent);
};

export {
  fillActiveDialog,
  fakeEvent,
  setInputValue,
  setSelectValue,
  assertCleanHtml,
  assertInputValue,
  assertInputCheckbox,
  pSetListBoxItem
};
