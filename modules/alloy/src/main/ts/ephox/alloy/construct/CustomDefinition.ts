import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Optional, Result } from '@ephox/katamari';

import { AlloyComponent } from '../api/component/ComponentApi';
import { ComponentDetail, SimpleOrSketchSpec, StructDomSchema } from '../api/component/SpecTypes';
import { AlloyEventRecord } from '../api/events/AlloyEvents';
import * as NativeEvents from '../api/events/NativeEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import { DomDefinitionDetail } from '../dom/DomDefinition';
import { DomModification, nu as NuModification } from '../dom/DomModification';

// NB: Tsc requires AlloyEventHandler to be imported here.
export interface CustomDetail<A> {
  dom: StructDomSchema;
  // By this stage, the components are built.
  components: AlloyComponent[];
  uid: string;
  events: AlloyEventRecord;
  apis: A;
  eventOrder: Record<string, string[]>;
  domModification: Optional<DomModification>;
  originalSpec: SimpleOrSketchSpec;
  'debug.sketcher': string;
}

const baseBehaviour = 'alloy.base.behaviour';

const toInfo = <A>(spec: ComponentDetail): Result<CustomDetail<A>, any> => ValueSchema.asRaw('custom.definition', ValueSchema.objOf([
  FieldSchema.field('dom', 'dom', FieldPresence.strict(), ValueSchema.objOf([
    // Note, no children.
    FieldSchema.strict('tag'),
    FieldSchema.defaulted('styles', {}),
    FieldSchema.defaulted('classes', []),
    FieldSchema.defaulted('attributes', {}),
    FieldSchema.option('value'),
    FieldSchema.option('innerHtml')
  ])),
  FieldSchema.strict('components'),
  FieldSchema.strict('uid'),

  FieldSchema.defaulted('events', {}),
  FieldSchema.defaulted('apis', { }),

  // Use mergeWith in the future when pre-built behaviours conflict
  FieldSchema.field(
    'eventOrder',
    'eventOrder',
    FieldPresence.mergeWith({
      // Note, not using constant behaviour names to avoid code size of unused behaviours
      [SystemEvents.execute()]: [ 'disabling', baseBehaviour, 'toggling', 'typeaheadevents' ],
      [SystemEvents.focus()]: [ baseBehaviour, 'focusing', 'keying' ],
      [SystemEvents.systemInit()]: [ baseBehaviour, 'disabling', 'toggling', 'representing' ],
      [NativeEvents.input()]: [ baseBehaviour, 'representing', 'streaming', 'invalidating' ],
      [SystemEvents.detachedFromDom()]: [ baseBehaviour, 'representing', 'item-events', 'tooltipping' ],
      [NativeEvents.mousedown()]: [ 'focusing', baseBehaviour, 'item-type-events' ],
      [NativeEvents.touchstart()]: [ 'focusing', baseBehaviour, 'item-type-events' ],
      [NativeEvents.mouseover()]: [ 'item-type-events', 'tooltipping' ],
      [SystemEvents.receive()]: [ 'receiving', 'reflecting', 'tooltipping' ]
    }),
    ValueSchema.anyValue()
  ),

  FieldSchema.option('domModification')
]), spec);

const toDefinition = (detail: CustomDetail<any>): DomDefinitionDetail =>
  // EFFICIENCY: Consider not merging here.
  ({
    ...detail.dom,
    uid: detail.uid,
    domChildren: Arr.map(detail.components, (comp) => comp.element)
  });

const toModification = (detail: CustomDetail<any>): DomModification => detail.domModification.fold(() => NuModification({ }), NuModification);

const toApis = <A>(info: CustomDetail<A>): A => info.apis;

const toEvents = (info: CustomDetail<any>): AlloyEventRecord => info.events;

export {
  toInfo,
  toDefinition,
  toModification,
  toApis,
  toEvents
};
