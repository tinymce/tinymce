import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';

import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import { Toggling } from '../../api/behaviour/Toggling';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { TogglingConfigSpec } from '../../behaviour/toggling/TogglingTypes';
import * as Fields from '../../data/Fields';
import * as ButtonBase from '../../ui/common/ButtonBase';
import { NormalItemDetail } from '../../ui/types/ItemTypes';
import * as ItemEvents from '../util/ItemEvents';

const builder = (detail: NormalItemDetail): AlloySpec => ({
  dom: detail.dom,
  domModification: {
    // INVESTIGATE: If more efficient, destructure attributes out
    ...detail.domModification,
    attributes: {
      'role':  detail.toggling.isSome() ? 'menuitemcheckbox' : 'menuitem',
      ...detail.domModification.attributes,
      'aria-haspopup': detail.hasSubmenu,
      ...(detail.hasSubmenu ? { 'aria-expanded': false } : {})
    }
  },

  behaviours: SketchBehaviours.augment(
    detail.itemBehaviours,
    [
      // Investigate, is the Toggling.revoke still necessary here?
      detail.toggling.fold(Toggling.revoke, (tConfig: TogglingConfigSpec) => Toggling.config({
        aria: {
          mode: 'checked'
        },
        ...tConfig
      })),
      Focusing.config({
        ignore: detail.ignoreFocus,
        // Rationale: because nothing is focusable, when you click
        // on the items to choose them, the focus jumps to the first
        // focusable outer container ... often the body. If we prevent
        // mouseDown ... that doesn't happen. But only tested on Chrome/FF.
        stopMousedown: detail.ignoreFocus,
        onFocus(component) {
          ItemEvents.onFocus(component);
        }
      }),
      Keying.config({
        mode: 'execution'
      }),
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: detail.data
        }
      }),

      AddEventsBehaviour.config('item-type-events', [
        // Treat clicks the same as a button
        ...ButtonBase.pointerEvents(),

        AlloyEvents.run(NativeEvents.mouseover(), ItemEvents.onHover),

        AlloyEvents.run(SystemEvents.focusItem(), Focusing.focus)
      ])
    ]
  ),
  components: detail.components,
  eventOrder: detail.eventOrder
});

const schema: FieldProcessorAdt[] = [
  FieldSchema.strict('data'),
  FieldSchema.strict('components'),
  FieldSchema.strict('dom'),
  FieldSchema.defaulted('hasSubmenu', false),

  FieldSchema.option('toggling'),

  // Maybe this needs to have fewer behaviours
  SketchBehaviours.field('itemBehaviours', [ Toggling, Focusing, Keying, Representing ]),

  FieldSchema.defaulted('ignoreFocus', false),
  FieldSchema.defaulted('domModification', { }),
  Fields.output('builder', builder),
  FieldSchema.defaulted('eventOrder', { })
];

export default schema;
