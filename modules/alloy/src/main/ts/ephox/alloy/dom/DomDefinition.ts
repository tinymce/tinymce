import { JSON as Json } from '@ephox/sand';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

export interface GeneralDefinitionSpec<EC> {
  uid: string;
  tag?: string;
  attributes?: Record<string, any>;
  classes?: string[];
  styles?: Record<string, string>;
  value?: any;
  innerHtml?: string;
  domChildren?: EC;
  // defChildren?: DC[];
}

export interface DomDefinitionSpec extends GeneralDefinitionSpec<Element> {

}

export interface GeneralDefinitionDetail<EC> {
  uid: string;
  tag: string;
  attributes: Record<string, any>;
  classes: string[];
  styles: Record<string, string>;
  value: Option<any>;
  innerHtml: Option<string>;
  domChildren: EC[];
}

export interface DomDefinitionDetail extends GeneralDefinitionDetail<Element> {

}

const defToStr = (defn: GeneralDefinitionDetail<any>): string => {
  const raw = defToRaw(defn);
  return Json.stringify(raw, null, 2);
};

const defToRaw = (defn: GeneralDefinitionDetail<Element>): GeneralDefinitionSpec<string> => {
  return {
    uid: defn.uid,
    tag: defn.tag,
    classes: defn.classes,
    attributes: defn.attributes,
    styles: defn.styles,
    value: defn.value.getOr('<none>'),
    innerHtml: defn.innerHtml.getOr('<none>'),
    domChildren: defn.domChildren.length === 0 ? '0 children, but still specified' : String(defn.domChildren.length)
  };
};

export {
  defToStr,
  defToRaw
};