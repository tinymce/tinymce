import { JSON as Json } from '@ephox/sand';
import { Struct, Option, Arr } from '@ephox/katamari';
import { SugarElement } from '../alien/TypeDefinitions';

export interface GeneralDefinitionSpec<EC, DC> {
  tag?: string;
  attributes?: Record<string, any>;
  classes?: string[];
  styles?: Record<string, string>;
  value?: any;
  innerHtml?: string;
  domChildren?: EC;
  defChildren?: DC[];
}

export interface DomDefinitionSpec extends GeneralDefinitionSpec<SugarElement[], DomDefinitionSpec> {

}

export interface GeneralDefinitionDetail<EC, DC> {
  tag(): string;
  attributes(): Option<Record<string, any>>;
  classes(): Option<string[]>;
  styles(): Option<Record<string, string>>;
  value(): Option<any>;
  innerHtml(): Option<string>;
  domChildren(): Option<EC>;
  defChildren(): Option<DC>;
}

export interface DomDefinitionDetail extends GeneralDefinitionDetail<SugarElement[], DomDefinitionDetail[]> {

}

const nu = Struct.immutableBag([ 'tag' ], [
  'classes',
  'attributes',
  'styles',
  'value',
  'innerHtml',
  'domChildren',
  'defChildren'
]) as (s: DomDefinitionSpec) => DomDefinitionDetail;

const defToStr = (defn: GeneralDefinitionDetail<any, any>): string => {
  const raw = defToRaw(defn);
  return Json.stringify(raw, null, 2);
};

const defToRaw = (defn: GeneralDefinitionDetail<string, GeneralDefinitionDetail<string, any>>): GeneralDefinitionSpec<string, any> => {
  return {
    tag: defn.tag(),
    classes: defn.classes().getOr([ ]),
    attributes: defn.attributes().getOr({ }),
    styles: defn.styles().getOr({ }),
    value: defn.value().getOr('<none>'),
    innerHtml: defn.innerHtml().getOr('<none>'),
    defChildren: defn.defChildren().fold(
      () => '<none>',
      (d) => Json.stringify(d, null, 2)
    ),
    domChildren: defn.domChildren().fold(() => {
      return '<none>';
    }, (children) => {
      return children.length === 0 ? '0 children, but still specified' : String(children.length);
    }) as string
  };
};

export {
  nu,
  defToStr,
  defToRaw
};