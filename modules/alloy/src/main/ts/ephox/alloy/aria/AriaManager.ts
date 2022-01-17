import { Id } from "@ephox/katamari";
import { Attribute, SugarElement } from "@ephox/sugar";

export interface AriaManager {
  id: string;
  link: (elem: SugarElement<Element>) => void;
  unlink: (elem: SugarElement<Element>) => void;
};

export enum LinkableAttribute {
  AriaOwns = "aria-owns",
  AriaControls = "aria-controls"
};

const build = (attribute: LinkableAttribute) => {
  const manager = (): AriaManager => {
    const ariaId = Id.generate(attribute);

    const link = (elem: SugarElement<Element>) => {
      Attribute.set(elem, attribute, ariaId);
    };

    const unlink = (elem: SugarElement<Element>) => {
      Attribute.remove(elem, attribute);
    };

    return {
      id: ariaId,
      link,
      unlink,
    };
  };

  return manager;
};

export { build };
