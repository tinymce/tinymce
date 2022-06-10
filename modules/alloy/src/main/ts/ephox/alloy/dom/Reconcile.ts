import { Arr, Obj } from '@ephox/katamari';
import { Attribute, Classes, Css, Html, SugarElement, Value } from '@ephox/sugar';

import { DomDefinitionDetail } from './DomDefinition';
import { patchDomChildren } from './Patching';

interface KeyValueDiff {
  readonly toSet: Record<string, string>;
  readonly toRemove: string[];
}

const diffKeyValueSet = (newObj: Record<string, string>, oldObj: Record<string, string>): KeyValueDiff => {
  const newKeys = Obj.keys(newObj);
  const oldKeys = Obj.keys(oldObj);
  const toRemove = Arr.difference(oldKeys, newKeys);
  const toSet = Obj.bifilter(newObj, (v, k) => {
    return !Obj.has(oldObj, k) || v !== oldObj[k];
  }).t;

  return { toRemove, toSet };
};

const reconcileToDom = (definition: DomDefinitionDetail, obsoleted: SugarElement<Element>): SugarElement<Element> => {
  const { class: clazz, style, ...existingAttributes } = Attribute.clone(obsoleted);
  const { toSet: attrsToSet, toRemove: attrsToRemove } = diffKeyValueSet(definition.attributes, existingAttributes);

  const updateAttrs = () => {
    Arr.each(attrsToRemove, (a) => Attribute.remove(obsoleted, a));
    Attribute.setAll(obsoleted, attrsToSet);
  };

  const existingStyles = Css.getAllRaw(obsoleted);
  const { toSet: stylesToSet, toRemove: stylesToRemove } = diffKeyValueSet(definition.styles, existingStyles);
  const updateStyles = () => {
    Arr.each(stylesToRemove, (s) => Css.remove(obsoleted, s));
    Css.setAll(obsoleted, stylesToSet);
  };

  const existingClasses = Classes.get(obsoleted);
  const classesToRemove = Arr.difference(existingClasses, definition.classes);
  const classesToAdd = Arr.difference(definition.classes, existingClasses);

  const updateClasses = () => {
    Classes.add(obsoleted, classesToAdd);
    Classes.remove(obsoleted, classesToRemove);
  };

  const updateHtml = (html: string) => {
    Html.set(obsoleted, html);
  };

  const updateChildren = () => {
    const children = definition.domChildren;
    patchDomChildren(obsoleted, children);
  };

  const updateValue = () => {
    const valueElement = obsoleted as SugarElement<HTMLInputElement | HTMLTextAreaElement>;
    const value = definition.value.getOrUndefined();
    if (value !== Value.get(valueElement)) {
      // TINY-8736: Value.set throws an error in case the value is undefined
      Value.set(valueElement, value ?? '');
    }
  };

  updateAttrs();
  updateClasses();
  updateStyles();
  // Patching can only support one form of children, so we only update the html or the children, but never both
  definition.innerHtml.fold(updateChildren, updateHtml);
  updateValue();

  return obsoleted;
};

export {
  reconcileToDom
};
