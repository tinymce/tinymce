import { Optional } from '@ephox/katamari';
import { Attribute, Classes, Css, Html, InsertAll, SugarElement, SugarNode, Value } from '@ephox/sugar';

import { isPremade } from '../api/ui/GuiTypes';
import * as Tagger from '../registry/Tagger';
import * as DomDefinition from './DomDefinition';
import { reconcileToDom } from './Reconcile';

const introduceToDom = (definition: DomDefinition.GeneralDefinitionDetail<SugarElement<Node>>): SugarElement<HTMLElement> => {
  const subject = SugarElement.fromTag(definition.tag);
  Attribute.setAll(subject, definition.attributes);
  Classes.add(subject, definition.classes);
  Css.setAll(subject, definition.styles);
  // Remember: Order of innerHtml vs children is important.
  definition.innerHtml.each((html) => Html.set(subject, html));

  // Children are already elements.
  const children = definition.domChildren;
  InsertAll.append(subject, children);

  definition.value.each((value) => {
    Value.set(subject as SugarElement<HTMLInputElement | HTMLTextAreaElement>, value);
  });

  return subject;
};

const attemptPatch = (definition: DomDefinition.GeneralDefinitionDetail<SugarElement<Node>>, obsoleted: SugarElement<Element>): Optional<SugarElement<Element>> => {
  try {
    const e = reconcileToDom(definition, obsoleted);
    return Optional.some(e);
  } catch (err) {
    return Optional.none();
  }
};

// If a component has both innerHtml and children then we can't patch it
const hasMixedChildren = (definition: DomDefinition.GeneralDefinitionDetail<SugarElement<Node>>) =>
  definition.innerHtml.isSome() && definition.domChildren.length > 0;

const renderToDom = (definition: DomDefinition.GeneralDefinitionDetail<SugarElement<Node>>, optObsoleted: Optional<SugarElement<Node>>): SugarElement<Element> => {
  // If the current tag doesn't match, let's not try to add anything further down the tree.
  // If it does match though and we don't have mixed children then attempt to patch attributes etc...
  const canBePatched = (candidate: SugarElement<Node>): candidate is SugarElement<Element> =>
    SugarNode.name(candidate) === definition.tag && !hasMixedChildren(definition) && !isPremade(candidate);

  const elem = optObsoleted
    .filter(canBePatched)
    .bind((obsoleted) => attemptPatch(definition, obsoleted))
    .getOrThunk(() => introduceToDom(definition));

  Tagger.writeOnly(elem, definition.uid);

  return elem;
};

export {
  renderToDom
};
