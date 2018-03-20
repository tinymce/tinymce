import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Height, Location, Width } from '@ephox/sugar';

import { Coupling } from '../../api/behaviour/Coupling';
import { Toggling } from '../../api/behaviour/Toggling';
import { Unselecting } from '../../api/behaviour/Unselecting';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as InternalSink from '../../parts/InternalSink';
import * as PartType from '../../parts/PartType';
import * as Layout from '../../positioning/layout/Layout';

const anchorAtCentre = function (component) {
  const pos = Location.absolute(component.element());
  const w = Width.get(component.element());
  const h = Height.get(component.element());
  return {
    anchor: 'makeshift',
    x: pos.left() + w / 2,
    y: pos.top() + h / 2,
    layouts: [ Layout.southmiddle, Layout.northmiddle ]
  };
};

// Similar to dropdown.
const schema = Fun.constant([
  FieldSchema.strict('dom'),
  FieldSchema.strict('fetch'),
  Fields.onHandler('onOpen'),
  Fields.onKeyboardHandler('onExecute'),
  Fields.onHandler('onTap'),
  Fields.onHandler('onHoverOn'),
  Fields.onHandler('onHoverOff'),
  Fields.onHandler('onMiss'),
  SketchBehaviours.field('touchmenuBehaviours', [ Toggling, Unselecting, Coupling ]),
  FieldSchema.strict('toggleClass'),
  FieldSchema.option('lazySink'),
  FieldSchema.option('role'),
  FieldSchema.defaulted('eventOrder', { }),

  Fields.onHandler('onClosed'),

  FieldSchema.option('menuTransition'),

  FieldSchema.defaulted('getAnchor', anchorAtCentre)
]);

const parts = Fun.constant([
  PartType.external({
    schema: [
      Fields.itemMarkers()
    ],
    name: 'menu'
  }),

  PartType.external({
    schema: [ FieldSchema.strict('dom') ],
    name: 'view'
  }),

  InternalSink.partType()
]);

const name = Fun.constant('TouchMenu');

export {
  name,
  schema,
  parts
};