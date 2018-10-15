import { FieldSchema } from '@ephox/boulder';
import { Fun, Merger, Option, Result } from '@ephox/katamari';
import * as ComponentStructure from '../../alien/ComponentStructure';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import * as SystemEvents from '../../api/events/SystemEvents';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';
import * as Fields from '../../data/Fields';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import * as Dismissal from '../../sandbox/Dismissal';
import { InlineViewDetail, InlineViewSketcher, InlineViewSpec, InlineMenuSpec } from '../../ui/types/InlineViewTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Positioning } from '../behaviour/Positioning';
import { Receiving } from '../behaviour/Receiving';
import { Sandboxing } from '../behaviour/Sandboxing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { tieredMenu } from './TieredMenu';
import { Bounds } from 'ephox/alloy/alien/Boxes';

const makeMenu = (lazySink: () => Result<AlloyComponent, Error>, menuSandbox: AlloyComponent, anchor: AnchorSpec, menuSpec: InlineMenuSpec) => {
  return tieredMenu.sketch({
    dom: {
      tag: 'div'
    },

    data: menuSpec.data,
    markers: menuSpec.menu.markers,

    onEscape() {
      return Option.some(true);
    },

    onExecute() {
      return Option.some(true);
    },

    onOpenMenu(notmysandbox, menu) {
      Positioning.position(lazySink().getOrDie(), anchor, menu);
    },

    onOpenSubmenu(notmysandbox, item, submenu) {
      const sink = lazySink().getOrDie();
      Positioning.position(sink, {
        anchor: 'submenu',
        item
      }, submenu);
    },
  });
};

const factory: SingleSketchFactory<InlineViewDetail, InlineViewSpec> = (detail, spec): SketchSpec => {
  const isPartOfRelated = (container, queryElem) => {
    const related = detail.getRelated()(container);
    return related.exists((rel) => {
      return ComponentStructure.isPartOf(rel, queryElem);
    });
  };

  return Merger.deepMerge(
    {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Sandboxing.config({
            isPartOf (container, data, queryElem) {
              return ComponentStructure.isPartOf(data, queryElem) || isPartOfRelated(container, queryElem);
            },
            getAttachPoint () {
              return detail.lazySink()().getOrDie();
            }
          }),
          Dismissal.receivingConfig(
            Merger.deepMerge(
              {
                isExtraPart: Fun.constant(false),
              },
              detail.fireDismissalEventInstead().map((fe) => ({
                fireEventInstead: {
                  event: fe.event()
                }
              } as any)).getOr({ })
            )
          )
        ]),
        SketchBehaviours.get(detail.inlineBehaviours())
      ),
      eventOrder: detail.eventOrder(),

      apis: {
        setContent (sandbox: AlloyComponent, thing: AlloySpec) {
          // Keep the same location, and just change the content.
          Sandboxing.open(sandbox, thing);
        },
        showAt (sandbox: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec) {
          const sink = detail.lazySink()().getOrDie();
          Sandboxing.openWhileCloaked(sandbox, thing, () => Positioning.position(sink, anchor, sandbox));
          detail.onShow()(sandbox);
        },
        showWithin (sandbox: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec, getBounds: () => Bounds) {
          const sink = detail.lazySink()().getOrDie();
          Sandboxing.openWhileCloaked(sandbox, thing, () => Positioning.positionWithin(sink, anchor, sandbox, getBounds));
          detail.onShow()(sandbox);
        },
        // TODO AP-191 write a test for showMenuAt
        showMenuAt(sandbox: AlloyComponent, anchor: AnchorSpec, menuSpec: InlineMenuSpec) {
          const thing = makeMenu(detail.lazySink(), sandbox, anchor, menuSpec);

          Sandboxing.open(sandbox, thing);
          detail.onShow()(sandbox);
        },
        hide (sandbox: AlloyComponent) {
          Sandboxing.close(sandbox);
          detail.onHide()(sandbox);
        },
        getContent (sandbox: AlloyComponent): Option<AlloyComponent> {
          return Sandboxing.getState(sandbox);
        },
        isOpen: Sandboxing.isOpen
      }
    }
  );
};

const InlineView = Sketcher.single({
  name: 'InlineView',
  configFields: [
    FieldSchema.strict('lazySink'),
    Fields.onHandler('onShow'),
    Fields.onHandler('onHide'),
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
    showWithin (apis, component, anchor, thing, bounds) {
      apis.showWithin(component, anchor, thing, bounds);
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
