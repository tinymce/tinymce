import { Fun, Merger, Option } from '@ephox/katamari';

import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as ButtonBase from '../../ui/common/ButtonBase';
import * as DropdownSchema from '../../ui/schema/DropdownSchema';
import { DropdownDetail, DropdownSketcher, DropdownSpec } from '../../ui/types/DropdownTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Toggling } from '../behaviour/Toggling';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { HotspotAnchorSpec } from '../../positioning/mode/Anchoring';
import { AlloyComponent } from '../../api/component/ComponentApi';

const factory: CompositeSketchFactory<DropdownDetail, DropdownSpec> = (detail, components: AlloySpec[], _spec: DropdownSpec, externals): SketchSpec => {
  const switchToMenu = (sandbox) => {
    Composing.getCurrent(sandbox).each((current) => {
      Highlighting.highlightFirst(current);
      Keying.focusIn(current);
    });
  };

  const getAnchor = (component: AlloyComponent): HotspotAnchorSpec => {
    const ourHotspot = detail.getHotspot()(component).getOr(component)
    return { anchor: 'hotspot', hotspot: ourHotspot };
  }

  const action = (component: AlloyComponent): void => {
    const anchor = getAnchor(component);
    const onOpenSync = switchToMenu;
    DropdownUtils.togglePopup(detail, (x) => x, anchor, component, externals, onOpenSync).get(Fun.noop);
  };

  return Merger.deepMerge(
    {
      events: ButtonBase.events(
        Option.some(action)
      )
    },
    {
      uid: detail.uid(),
      dom: detail.dom(),
      components,
      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Toggling.config({
            toggleClass: detail.toggleClass(),
            aria: {
              // INVESTIGATE: Are we sure we want aria-pressed as well as aria-expanded here?
              mode: 'pressed',
              syncWithExpanded: true
            }
          }),
          Coupling.config({
            others: {
              sandbox (hotspot) {
                const anchor = getAnchor(hotspot)
                return DropdownUtils.makeSandbox(detail, anchor, hotspot, {
                  onOpen () { Toggling.on(hotspot); },
                  onClose () { Toggling.off(hotspot); }
                });
              }
            }
          }),
          Keying.config({
            mode: 'execution',
            useSpace: true
          }),
          Focusing.config({ })
        ]),
        SketchBehaviours.get(detail.dropdownBehaviours())
      ),

      eventOrder: {
        // Order, the button state is toggled first, so assumed !selected means close.
        'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
      }
    },
    {
      dom: {
        attributes: {
          'role': detail.role().getOr('button'),
          'aria-haspopup': 'true'
        }
      }
    }
  );
};

const Dropdown = Sketcher.composite({
  name: 'Dropdown',
  configFields: DropdownSchema.schema(),
  partFields: DropdownSchema.parts(),
  factory
}) as DropdownSketcher;

export {
  Dropdown
};