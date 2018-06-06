import { FieldSchema } from '@ephox/boulder';
import { Fun, Merger, Option } from '@ephox/katamari';
import { SketchSpec } from 'ephox/alloy/api/component/SpecTypes';

import * as ComponentStructure from '../../alien/ComponentStructure';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Dismissal from '../../sandbox/Dismissal';
import * as Behaviour from '../behaviour/Behaviour';
import { Positioning } from '../behaviour/Positioning';
import { Receiving } from '../behaviour/Receiving';
import { Sandboxing } from '../behaviour/Sandboxing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';

export interface InlineViewSketch extends Sketcher.SingleSketch {
  // InlineViewApis;
  showAt: (component: AlloyComponent, anchor: InlineViewAnchor, thing: SketchSpec) => void;
  hide: (component: AlloyComponent) => void;
  isOpen: (component: AlloyComponent) => boolean;
}

export interface InlineViewAnchor {
  anchor: string;
  x?: number;
  y?: number;
  item?: AlloyComponent;
  root?: SugarElement;
}

const factory = function (detail, spec) {
  const isPartOfRelated = function (container, queryElem) {
    const related = detail.getRelated()(container);
    return related.exists(function (rel) {
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
          Dismissal.receivingConfig({
            isExtraPart: Fun.constant(false)
          })
        ]),
        SketchBehaviours.get(detail.inlineBehaviours())
      ),
      eventOrder: detail.eventOrder(),

      apis: {
        showAt (sandbox, anchor, thing) {
          const sink = detail.lazySink()().getOrDie();
          Sandboxing.cloak(sandbox);
          Sandboxing.open(sandbox, thing);
          Positioning.position(sink, anchor, sandbox);
          Sandboxing.decloak(sandbox);
          detail.onShow()(sandbox);
        },
        hide (sandbox) {
          Sandboxing.close(sandbox);
          detail.onHide()(sandbox);
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
    FieldSchema.defaulted('getRelated', Option.none),
    FieldSchema.defaulted('eventOrder', Option.none)
  ],
  factory,
  apis: {
    showAt (apis, component, anchor, thing) {
      apis.showAt(component, anchor, thing);
    },
    hide (apis, component) {
      apis.hide(component);
    },
    isOpen (apis, component) {
      return apis.isOpen(component);
    }
  }
}) as InlineViewSketch;

export {
  InlineView
};