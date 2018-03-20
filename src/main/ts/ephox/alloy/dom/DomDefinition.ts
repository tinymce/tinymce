import { JSON as Json } from '@ephox/sand';
import { Struct, Option } from '@ephox/katamari';

export interface DomDefinition {
  attributes(): Option<{}>;
  classes(): Option<string[]>;
  styles(): Option<{}>;
  value(): Option<string>;
  innerHtml(): Option<string>;
  domChildren(): Option<string>;
  defChildren(): Option<string>;
}

const nu = Struct.immutableBag([ 'tag' ], [
  'classes',
  'attributes',
  'styles',
  'value',
  'innerHtml',
  'domChildren',
  'defChildren'
]);

const defToStr = function (defn) {
  const raw = defToRaw(defn);
  return Json.stringify(raw, null, 2);
};

const defToRaw = function (defn) {
  return {
    tag: defn.tag(),
    classes: defn.classes().getOr([ ]),
    attributes: defn.attributes().getOr({ }),
    styles: defn.styles().getOr({ }),
    value: defn.value().getOr('<none>'),
    innerHtml: defn.innerHtml().getOr('<none>'),
    defChildren: defn.defChildren().getOr('<none>'),
    domChildren: defn.domChildren().fold(function () {
      return '<none>';
    }, function (children) {
      return children.length === 0 ? '0 children, but still specified' : String(children.length);
    })
  };
};

export {
  nu,
  defToStr,
  defToRaw
};