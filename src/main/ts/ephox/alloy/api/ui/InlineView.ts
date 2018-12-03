import { FieldSchema } from '@ephox/boulder';
import { Fun, Option, Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as ComponentStructure from '../../alien/ComponentStructure';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import * as SystemEvents from '../../api/events/SystemEvents';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';
import * as Fields from '../../data/Fields';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import * as Dismissal from '../../sandbox/Dismissal';
import { InlineMenuSpec, InlineViewDetail, InlineViewSketcher, InlineViewSpec } from '../../ui/types/InlineViewTypes';
import { Positioning } from '../behaviour/Positioning';
import { Receiving } from '../behaviour/Receiving';
import { Sandboxing } from '../behaviour/Sandboxing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { tieredMenu } from './TieredMenu';
import { LazySink } from '../component/CommonTypes';

const makeMenu = (detail: InlineViewDetail, menuSandbox: AlloyComponent, anchor: AnchorSpec, menuSpec: InlineMenuSpec) => {
  const lazySink: () => ReturnType<LazySink> = () => detail.lazySink(menuSandbox);
  return tieredMenu.sketch({
    dom: {
      tag: 'div'
    },

    data: menuSpec.data,
    markers: menuSpec.menu.markers,

    onEscape() {
      // Note for the future: this should possibly also call detail.onHide
      Sandboxing.close(menuSandbox);
      detail.onEscape.map((handler) => {
        return handler(menuSandbox);
      });
      return Option.some(true);
    },

    onExecute() {
      return Option.some(true);
    },

    onOpenMenu(tmenu, menu) {
      Positioning.position(lazySink().getOrDie(), anchor, menu);
    },

    onOpenSubmenu(tmenu, item, submenu) {
      const sink = lazySink().getOrDie();
      Positioning.position(sink, {
        anchor: 'submenu',
        item
      }, submenu);
    },
  });
};

const factory: SingleSketchFactory<InlineViewDetail, InlineViewSpec> = (detail: InlineViewDetail, spec): SketchSpec => {
  const isPartOfRelated = (sandbox, queryElem) => {
    const related = detail.getRelated(sandbox);
    return related.exists((rel) => {
      return ComponentStructure.isPartOf(rel, queryElem);
    });
  };

  const setContent = (sandbox: AlloyComponent, thing: AlloySpec) => {
    // Keep the same location, and just change the content.
    Sandboxing.open(sandbox, thing);
  };
  const showAt = (sandbox: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec) => {
    const getBounds = Option.none();
    showWithin(sandbox, anchor, thing, getBounds);
  };
  const showWithin = (sandbox: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec, boxElement: Option<Element>) => {
    const sink = detail.lazySink(sandbox).getOrDie();
    Sandboxing.openWhileCloaked(sandbox, thing, () => Positioning.positionWithin(sink, anchor, sandbox, boxElement));
    detail.onShow(sandbox);
  };
  // TODO AP-191 write a test for showMenuAt
  const showMenuAt = (sandbox: AlloyComponent, anchor: AnchorSpec, menuSpec: InlineMenuSpec) => {
    const menu = makeMenu(detail, sandbox, anchor, menuSpec);

    Sandboxing.open(sandbox, menu);
    detail.onShow(sandbox);
  };
  const hide = (sandbox: AlloyComponent) => {
    Sandboxing.close(sandbox);
    detail.onHide(sandbox);
  };
  const getContent = (sandbox: AlloyComponent): Option<AlloyComponent> => {
    return Sandboxing.getState(sandbox);
  };

  const apis = {
    setContent,
    showAt,
    showWithin,
    showMenuAt,
    hide,
    getContent,
    isOpen: Sandboxing.isOpen
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    behaviours: SketchBehaviours.augment(
      detail.inlineBehaviours,
      [
        Sandboxing.config({
          isPartOf (sandbox, data, queryElem) {
            return ComponentStructure.isPartOf(data, queryElem) || isPartOfRelated(sandbox, queryElem);
          },
          getAttachPoint (sandbox) {
            return detail.lazySink(sandbox).getOrDie();
          }
        }),
        Dismissal.receivingConfig({
          isExtraPart: Fun.constant(false),
          ...detail.fireDismissalEventInstead.map((fe) => ({
            fireEventInstead: {
              event: fe.event
            }
          } as any)).getOr({ })
        })
      ]
    ),
    eventOrder: detail.eventOrder,

    apis
  };
};

const InlineView = Sketcher.single({
  name: 'InlineView',
  configFields: [
    FieldSchema.strict('lazySink'),
    Fields.onHandler('onShow'),
    Fields.onHandler('onHide'),
    FieldSchema.optionFunction('onEscape'),
    SketchBehaviours.field('inlineBehaviours', [ Sandboxing, Receiving ]),
    FieldSchema.optionObjOf('fireDismissalEventInstead', [
      FieldSchema.defaulted('event', SystemEvents.dismissRequested())
    ]),
    FieldSchema.defaulted('getRelated', Option.none),
    FieldSchema.defaulted('eventOrder', Option.none)
  ],
  factory,
  apis: {
    showAt (apis, component, anchor, thing) {
      apis.showAt(component, anchor, thing);
    },
    showWithin (apis, component, anchor, thing, boxElement) {
      apis.showWithin(component, anchor, thing, boxElement);
    },
    showMenuAt(apis, component, anchor, menuSpec) {
      apis.showMenuAt(component, anchor, menuSpec);
    },
    hide (apis, component) {
      apis.hide(component);
    },
    isOpen (apis, component) {
      return apis.isOpen(component);
    },
    getContent (apis, component) {
      return apis.getContent(component);
    },
    setContent (apis, component, thing) {
      apis.setContent(component, thing);
    }
  }
}) as InlineViewSketcher;

export { InlineView };
