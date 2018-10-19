import { Arr } from '@ephox/katamari';
import { Attr, Classes, Css, Element, Html, InsertAll, Value } from '@ephox/sugar';

import * as DomDefinition from './DomDefinition';
import * as Tagger from '../registry/Tagger';
import { StructDomSchema } from '../api/component/SpecTypes';

const getChildren = (definition) => {
  if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
    throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + DomDefinition.defToStr(definition));
  } else {
    return definition.domChildren().fold(() => {
      const defChildren = definition.defChildren().getOr([ ]);
      return Arr.map(defChildren, renderDef);
    }, (domChildren) => {
      return domChildren;
    });
  }
};

const renderToDom = (definition: DomDefinition.GeneralDefinitionDetail<any,any>) => {
  const subject = Element.fromTag(definition.tag);
  Attr.setAll(subject, definition.attributes);
  Classes.add(subject, definition.classes);
  Css.setAll(subject, definition.styles);
  // Remember: Order of innerHtml vs children is important.
  definition.innerHtml.each((html) => Html.set(subject, html));

  // Children are already elements.
  const children = definition.domChildren
  InsertAll.append(subject, children);

  definition.value.each((value) => {
    Value.set(subject, value);
  });

  if (! definition.uid) {
    debugger;
  }
  Tagger.writeOnly(subject, definition.uid);

  return subject;
};

const renderDef = (spec) => {
  const definition = DomDefinition.nu(spec);
  return renderToDom(definition);
};

export {
  renderToDom
};