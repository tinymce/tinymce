import { Attribute, Classes, Css, Html, InsertAll, SugarElement, Value } from '@ephox/sugar';

import * as Tagger from '../registry/Tagger';
import * as DomDefinition from './DomDefinition';

const renderToDom = (definition: DomDefinition.GeneralDefinitionDetail<SugarElement>): SugarElement => {
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

export {
  renderToDom
};
