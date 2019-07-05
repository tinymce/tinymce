import { Arr, Obj } from '@ephox/katamari';
import { Attr, Css } from '@ephox/sugar';

import { SketchSpec } from '../../api/component/SpecTypes';
import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import {
  SlotContainerApis,
  SlotContainerDetail,
  SlotContainerSketcher,
  SlotContainerSpecBuilder,
} from '../../ui/types/SlotContainerTypes';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyTriggers from '../events/AlloyTriggers';
import * as SystemEvents from '../events/SystemEvents';
import * as GuiTypes from './GuiTypes';
import * as UiSketcher from './UiSketcher';

const owner = 'container';

const schema = [
  SketchBehaviours.field('slotBehaviours', [])
];

const getPartName = (name) => {
  return '<alloy.field.' + name + '>';
};

const sketch = (sSpec: SlotContainerSpecBuilder): SketchSpec => {
  // As parts.slot is called, record all of the parts that are registered
  // as part of this SlotContainer.
  const parts = (() => {
    const record: string[] = [];

    const slot = (name: string, config: any): AlloyParts.ConfiguredPart => {
      record.push(name);
      return AlloyParts.generateOne(owner, getPartName(name), config);
    };

    return {
      slot,
      record() { return record; }
    };
  })();

  const spec = sSpec(parts);

  const partNames = parts.record();

  // Like a Form, a SlotContainer does not know its parts in advance. So the
  // record lists the names of the parts to put in the schema.
  // TODO: Find a nice way to remove dupe with Form
  const fieldParts = Arr.map(partNames, (n) => {
    return PartType.required({ name: n, pname: getPartName(n) });
  });

  return UiSketcher.composite(owner, schema, fieldParts, make, spec);
};

const make = (detail: SlotContainerDetail, components, spec) => {
  type F<T> = (comp: AlloyComponent, key: string) => T;

  const getSlotNames = (_: AlloyComponent) => AlloyParts.getAllPartNames(detail);

  const getSlot = (container: AlloyComponent, key: string) =>
    AlloyParts.getPart(container, detail, key);

  const onSlot = <T>(f: F<T>, def: T = undefined) => (container: AlloyComponent, key: string) => {
    return AlloyParts.getPart(container, detail, key).map((slot) => f(slot, key)).getOr(def);
  };

  const onSlots = (f: (container: AlloyComponent, key: string) => void) => (container: AlloyComponent, keys: string[]) => {
    Arr.each(keys, (key) => f(container, key));
  };

  const doShowing = (comp: AlloyComponent, key: string): boolean => {
    return Attr.get(comp.element(), 'aria-hidden') !== 'true';
  };

  const doShow = (comp: AlloyComponent, key: string) => {
    // NOTE: May need to restore old values.
    if (!doShowing(comp, key)) {
      const element = comp.element();
      Css.remove(element, 'display');
      Attr.remove(element, 'aria-hidden');
      AlloyTriggers.emitWith(comp, SystemEvents.slotVisibility(), { name: key, visible: true });
    }
  };

  const doHide = (comp: AlloyComponent, key: string) => {
    // NOTE: May need to save old values.
    if (doShowing(comp, key)) {
      const element = comp.element();
      Css.set(element, 'display', 'none');
      Attr.set(element, 'aria-hidden', 'true');
      AlloyTriggers.emitWith(comp, SystemEvents.slotVisibility(), { name: key, visible: false });
    }
  };

  const isShowing = onSlot(doShowing, false);

  const hideSlot = onSlot(doHide);

  const hideSlots = onSlots(hideSlot);

  const hideAllSlots = (container: AlloyComponent) => hideSlots(container, getSlotNames(container));

  const showSlot = onSlot(doShow);

  const apis: SlotContainerApis = {
    getSlotNames,
    getSlot,
    isShowing,
    hideSlot,
    hideAllSlots,
    showSlot,
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    behaviours: SketchBehaviours.get(detail.slotBehaviours),
    apis
  };
};

// No type safety doing it this way. But removes dupe.
// We could probably use spread operator to help here.
const slotApis = Obj.map({
  getSlotNames: (apis, c) => apis.getSlotNames(c),
  getSlot: (apis, c, key) => apis.getSlot(c, key),
  isShowing: (apis, c, key) => apis.isShowing(c, key),
  hideSlot: (apis, c, key) => apis.hideSlot(c, key),
  hideAllSlots: (apis, c) => apis.hideAllSlots(c),
  showSlot: (apis, c, key) => apis.showSlot(c, key),
}, GuiTypes.makeApi);

const SlotContainer = {
  ...slotApis,
  ...{ sketch }
} as SlotContainerSketcher;

export {
  SlotContainer
};
