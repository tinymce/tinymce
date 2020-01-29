import { DomDefinitionDetail } from './DomDefinition';

export interface DomModification {
  classes: string[];
  attributes: Record<string, string | number | boolean>;
  styles: Record<string, string>;
}

export interface DomModificationSpec extends Partial<DomModification> {

}

// Maybe we'll need to allow add/remove
const nu = (s: DomModificationSpec): DomModification => ({
  classes: s.classes !== undefined ? s.classes : [ ],
  attributes: s.attributes !== undefined ? s.attributes : { },
  styles: s.styles !== undefined ? s.styles : { }
});

const modToStr = (mod: DomModification): string => {
  const raw = modToRaw(mod);
  return JSON.stringify(raw, null, 2);
};

const modToRaw = (mod: DomModification): any => {
  return mod;
};

const merge = (defnA: DomDefinitionDetail, mod: DomModification): DomDefinitionDetail => {
  return {
    ...defnA,
    attributes: { ...defnA.attributes, ...mod.attributes },
    styles: { ...defnA.styles, ...mod.styles },
    classes: defnA.classes.concat(mod.classes)
  };
};

export {
  nu,
  merge,
  // combine: combine,
  modToStr,
  modToRaw
};
