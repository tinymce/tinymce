import { FieldSchema } from '@ephox/boulder';
import { Fun, Merger, Option } from '@ephox/katamari';
import { SketchSpec, AlloySpec } from '../../api/component/SpecTypes';
import * as ComponentStructure from '../../alien/ComponentStructure';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Dismissal from '../../sandbox/Dismissal';
import * as Behaviour from '../behaviour/Behaviour';
import { Positioning } from '../behaviour/Positioning';
import { Receiving } from '../behaviour/Receiving';
import { Sandboxing } from '../behaviour/Sandboxing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { InlineViewSketcher, InlineViewDetail, InlineViewSpec } from '../../ui/types/InlineViewTypes';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import * as SystemEvents from '../../api/events/SystemEvents';
import { tieredMenu } from './TieredMenu';
import { TieredData } from '../../ui/types/TieredMenuTypes';
import { console } from '@ephox/dom-globals';

const makeMenu = (menuSandbox: AlloyComponent, lazySink, menuParts, anchor: AnchorSpec, data: TieredData) => {
  return tieredMenu.sketch({
    dom: {
      tag: 'div'
    },

    data,
    markers: menuParts.markers,

    onEscape() {
      console.log('context.menu.escape');
      return Option.some(true);
    },

    onExecute() {
      console.log('context.menu.execute');
      return Option.some(true);
    },

    onOpenMenu(notmysandbox, menu) {
      console.log('context.menu.onOpenMenu');
      Positioning.position(lazySink().getOrDie(), anchor, menu);
    },

    onOpenSubmenu(notmysandbox, item, submenu) {
      console.log('context.menu.onOpenSubmenu');
      const sink = lazySink().getOrDie();
      Positioning.position(sink, {
        anchor: 'submenu',
        item
      }, submenu);
      Sandboxing.decloak(menuSandbox);
    },
  });
}

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
                'fireEventInstead': {
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
        showAt (sandbox: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec) {
          const sink = detail.lazySink()().getOrDie();
          Sandboxing.cloak(sandbox);
          Sandboxing.open(sandbox, thing);
          Sandboxing.decloak(sandbox);
          detail.onShow()(sandbox);
        },
        showMenu(sandbox: AlloyComponent, anchor: AnchorSpec, menuSpec) {
          const thing = makeMenu(sandbox, detail.lazySink(), menuSpec.parts.menu, anchor, menuSpec.data);

          Sandboxing.cloak(sandbox);
          Sandboxing.open(sandbox, thing);
          Sandboxing.decloak(sandbox);
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
    showMenu(apis, component, anchor, menuSpec) {
      apis.showMenu(component, anchor, menuSpec);
    },
    hide (apis, component) {
      apis.hide(component);
    },
    isOpen (apis, component) {
      return apis.isOpen(component);
    },
    getContent (apis, component) {
      return apis.getContent(component);
    }
  }
}) as InlineViewSketcher;

export {
  InlineView
};