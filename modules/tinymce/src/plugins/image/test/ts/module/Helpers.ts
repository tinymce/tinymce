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

export const generalTabLabels = {
  src: 'Source',
  title: 'Image title',
  alt: 'Alternative description',
  width: 'Width',
  height: 'Height',
  caption: 'Show caption',
  class: 'Class',
  images: 'Image list',
  decorative: 'Image is decorative'
};

export const advancedTabLabels = {
  border: 'Border width',
  hspace: 'Horizontal space',
  vspace: 'Vertical space',
  borderstyle: 'Border style'
};

const isObjWithValue = (value: ImageDialogData[keyof ImageDialogData]): value is { value: string } =>
  Type.isObject(value) && Obj.has(value as Record<string, any>, 'value');

const gotoAdvancedTab = (): void => {
  const tab = UiFinder.findIn(SugarBody.body(), 'div.tox-tab:contains(Advanced)').getOrDie();
  Mouse.click(tab);
};

const setFieldValue = (labelText: string, value: string | boolean): SugarElement<HTMLElement> => {
  const element = UiFinder.findTargetByLabel<HTMLInputElement>(SugarBody.body(), labelText).getOrDie();
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

const setTabFieldValues = (data: Partial<ImageDialogData>, tabLabels: Record<string, string>): void => {
  Obj.each(tabLabels, (value, key) => {
    Obj.get(data, key as keyof Omit<ImageDialogData, 'dimensions'>)
      .orThunk(() => Obj.has(data, 'dimensions') ? Obj.get(data.dimensions as Record<string, string>, key) : Optional.none())
      .each((obj) => {
        const newValue = isObjWithValue(obj) ? obj.value : obj;
        setFieldValue(tabLabels[key], newValue);
      });
  });
};

const fillActiveDialog = (data: Partial<ImageDialogData>, hasAdvanced = false): void => {
  setTabFieldValues(data, generalTabLabels);
  if (hasAdvanced) {
    gotoAdvancedTab();
    setTabFieldValues(data, advancedTabLabels);
  }
};

const fakeEvent = (elm: SugarElement<Node>, name: string): void => {
  const evt = document.createEvent('HTMLEvents');
  evt.initEvent(name, true, true);
  elm.dom.dispatchEvent(evt);
};

const setInputValue = (labelText: string, value: string): SugarElement<HTMLElement> => {
  const field = setFieldValue(labelText, value);
  fakeEvent(field, 'input');
  return field;
};

const setSelectValue = (labelText: string, value: string): SugarElement<HTMLElement> => {
  const field = setFieldValue(labelText, value);
  fakeEvent(field, 'change');
  return field;
};

const cleanHtml = (html: string): string =>
  html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');

const assertCleanHtml = (label: string, editor: Editor, expected: string): void =>
  Assertions.assertHtml(label, expected, cleanHtml(editor.getContent()));

const assertInputValue = (labelText: string, expected: string): void => {
  const element = UiFinder.findTargetByLabel<HTMLInputElement>(SugarBody.body(), labelText).getOrDie();
  const value = Value.get(element);
  assert.equal(value, expected, `input value should be ${expected}`);
};

const assertInputCheckbox = (labelText: string, expectedState: boolean): void => {
  const element = UiFinder.findTargetByLabel<HTMLInputElement>(SugarBody.body(), labelText).getOrDie();
  const value = Checked.get(element);
  assert.equal(value, expectedState, `input value should be ${expectedState}`);
};

const pSetListBoxItem = async (labelText: string, itemText: string): Promise<void> => {
  const listBox = UiFinder.findTargetByLabel(SugarBody.body(), labelText).getOrDie();
  Mouse.click(listBox);
  await UiFinder.pWaitForVisible('Wait for list to open', SugarBody.body(), '.tox-menu.tox-collection--list');
  const item = UiFinder.findIn(SugarBody.body(), '.tox-collection__item-label:contains(' + itemText + ')').getOrDie();
  const itemParent = Traverse.parent(item).getOrDie('Failed to find list box item parent');
  Mouse.click(itemParent);
};

const pWaitForDialogMeasurements = async (src: string): Promise<void> =>
  await UiFinder.pWaitForNotExists('Dialog did not clean up', SugarBody.body(), `img[src*="${src}"]`);

export {
  fillActiveDialog,
  fakeEvent,
  setInputValue,
  setSelectValue,
  assertCleanHtml,
  assertInputValue,
  assertInputCheckbox,
  pSetListBoxItem,
  pWaitForDialogMeasurements
};
