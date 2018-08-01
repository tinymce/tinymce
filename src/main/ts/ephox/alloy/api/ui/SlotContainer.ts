import { Arr, Merger, Obj, Option, Result } from '@ephox/katamari';

import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as GuiTypes from './GuiTypes';
import * as UiSketcher from './UiSketcher';
import { SketchSpec } from '../../api/component/SpecTypes';
import { SlotContainerSpecBuilder, SlotContainerDetail, SlotContainerSketcher } from '../../ui/types/SlotContainerTypes';
import { Css, Attr, Element } from '@ephox/sugar';
import { AlloyComponent } from '../component/ComponentApi';

const owner = 'container';

const schema = [
  SketchBehaviours.field('formBehaviours', [ Representing ])
];

const getPartName = (name) => {
  return '<alloy.field.' + name + '>';
};

const sketch = (sSpec: SlotContainerSpecBuilder): SketchSpec => {
  // As parts.slot is called, record all of the parts that are registered
  // as part of this SlotContainer.
  const parts = (() => {
    const record: string[] = [ ];

    const slot = (name: string, config: any): AlloyParts.ConfiguredPart => {
      record.push(name);
      return AlloyParts.generateOne(owner, getPartName(name), config);
    };

    return {
      slot,
      record () { return record; }
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
  const onSlot = (f) => (container: AlloyComponent, key: string) => {
    AlloyParts.getPart(container, detail, key).each((slot) => f(slot.element()));
  };

  const doShow = (element: Element) => {
    // NOTE: May need to restore old values.
    Css.remove(element, 'display');
    Attr.remove(element, 'aria-hidden');
  }

  const doHide = (element: Element) => {
    // NOTE: May need to save old values.
    Css.set(element, 'display', 'none');
    Attr.set(element, 'aria-hidden', 'true');
  }

  return Merger.deepMerge(
    {
      'debug.sketcher': {
        SlotContainer: spec
      },
      'uid': detail.uid(),
      'dom': detail.dom(),
      'components': components,

      'apis': {
        getSlot (container, key) {
          return AlloyParts.getPart(container, detail, key);
        },
        hideSlot: onSlot(doHide),
        showSlot: onSlot(doShow)
      }
    }
  );
};

// No type safety doing it this way. But removes dupe.
// We could probably use spread operator to help here.
const slotApis = Obj.map({
  getSlot: (apis, c, key) => apis.getSlot(c, key),
  showSlot: (apis, c, key) => apis.showSlot(c, key),
  hideSlot: (apis, c, key) => apis.hideSlot(c, key)
}, GuiTypes.makeApi);

const SlotContainer = Merger.deepMerge(
  slotApis,
  {
    sketch
  }
) as SlotContainerSketcher;

export {
  SlotContainer
};