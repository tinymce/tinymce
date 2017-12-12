import DomDefinition from './DomDefinition';
import { Arr } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Classes } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { Value } from '@ephox/sugar';

var getChildren = function (definition) {
  if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
    throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + DomDefinition.defToStr(definition));
  } else {
    return definition.domChildren().fold(function () {
      var defChildren = definition.defChildren().getOr([ ]);
      return Arr.map(defChildren, renderDef);
    }, function (domChildren) {
      return domChildren;
    });
  }
};

var renderToDom = function (definition) {
  var subject = Element.fromTag(definition.tag());
  Attr.setAll(subject, definition.attributes().getOr({ }));
  Classes.add(subject, definition.classes().getOr([ ]));
  Css.setAll(subject, definition.styles().getOr({ }));
  // Remember: Order of innerHtml vs children is important.
  Html.set(subject, definition.innerHtml().getOr(''));

  // Children are already elements.
  var children = getChildren(definition);
  InsertAll.append(subject, children);

  definition.value().each(function (value) {
    Value.set(subject, value);
  });

  return subject;
};

var renderDef = function (spec) {
  var definition = DomDefinition.nu(spec);
  return renderToDom(definition);
};

export default <any> {
  renderToDom: renderToDom
};