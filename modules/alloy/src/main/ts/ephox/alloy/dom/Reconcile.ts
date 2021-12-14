import { Arr, Fun, Obj } from '@ephox/katamari';
import { Attribute, Classes, Css, Html, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import * as Tagger from '../registry/Tagger';
import { DomDefinitionDetail } from './DomDefinition';
import { patchChildren } from './Patching';


interface KeyValueDiff {
  toSet: Record<string, string>;
  toRemove: string[];
}

const diffKeyValueSet = (newObj: Record<string, string>, oldObj: Record<string, string>): KeyValueDiff => {
  const newKeys = Obj.keys(newObj);
  const oldKeys = Obj.keys(oldObj);
  const toRemove = Arr.difference(oldKeys, newKeys);
  const toSet = Obj.bifilter(newObj, (v, k) => {
    return !oldObj.hasOwnProperty(k) || v !== oldObj[k];
  }).t;

  return { toRemove, toSet };
};

const reconcileToDom = (definition: DomDefinitionDetail, obsoleted: SugarElement<Element>): SugarElement<Element> => {
  // The tag was the same, so change the attributes etc.

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

  const updateHtml = () => {
    // Let's simplify ... don't support virtual DOM diffing if mixing HTML and children. Let's
    // just stop supporting that. If innerHtml is supplied, no child components.
    // Very experimental. If something doesn't have a UID, assume it was part of innerHTML
    const childrenOfObsolete = Traverse.children(obsoleted);

    if (Arr.forall(childrenOfObsolete, (c) => !SugarNode.isElement(c) || !Attribute.has(c, 'data-alloy-id')) && definition.domChildren.length === 0) {
      Html.set(obsoleted, definition.innerHtml.getOr(''));
    } else {
      // Do nothing
    }
  };

  const updateChildren = () => {
    if (definition.innerHtml.isNone()) {
      const children = definition.domChildren;
      patchChildren(
        children,
        (c, _i, _obs) => c,
        Fun.identity,
        obsoleted
      );
    } else {
      // No longer support HTML and children specified.
    }
  };

  const updateClasses = () => {
    Classes.add(obsoleted, classesToAdd);
    Classes.remove(obsoleted, classesToRemove);
  };

  updateAttrs();
  updateStyles();
  updateClasses();
  updateHtml();
  updateChildren();

  Tagger.writeOnly(obsoleted, definition.uid);

  // TODO: Something about value
  return obsoleted;
};

export {
  reconcileToDom
};