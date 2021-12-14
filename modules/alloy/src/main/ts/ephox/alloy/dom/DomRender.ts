import { Optional } from '@ephox/katamari';
import { Attribute, Classes, Css, Html, InsertAll, SugarElement, SugarNode, Value } from '@ephox/sugar';

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

  if (!definition.uid) {
    // eslint-disable-next-line no-debugger
    debugger;
  }
  Tagger.writeOnly(subject, definition.uid);

  return subject;
};

const attemptPatch = (definition: DomDefinition.GeneralDefinitionDetail<SugarElement<Node>>, obsoleted: SugarElement<Element>): Optional<SugarElement<Element>> => {
  try {
    const e = reconcileToDom(definition, obsoleted);
    return Optional.some(e);
  } catch (_) {
    return Optional.none();
  }
};

const renderToDom = (definition: DomDefinition.GeneralDefinitionDetail<SugarElement<Node>>, optObsoleted: Optional<SugarElement<any>>): SugarElement<any> => {
  const isSameTag = (candidate: SugarElement<any>) => {
    return SugarNode.name(candidate) === definition.tag;
  };

  const patched = optObsoleted.filter(isSameTag).bind(
    (o) => attemptPatch(definition, o)
  );

  return patched.getOrThunk(
    () => {
      // If the parent tag doesn't match, let's not try to
      // add anything further down the tree.
      return introduceToDom(definition);
    }
  );
};

export {
  renderToDom
};
