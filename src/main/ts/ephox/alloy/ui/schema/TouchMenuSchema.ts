import Coupling from '../../api/behaviour/Coupling';
import Toggling from '../../api/behaviour/Toggling';
import Unselecting from '../../api/behaviour/Unselecting';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Fields from '../../data/Fields';
import InternalSink from '../../parts/InternalSink';
import PartType from '../../parts/PartType';
import Layout from '../../positioning/layout/Layout';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Height } from '@ephox/sugar';
import { Location } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var anchorAtCentre = function (component) {
  var pos = Location.absolute(component.element());
  var w = Width.get(component.element());
  var h = Height.get(component.element());
  return {
    anchor: 'makeshift',
    x: pos.left() + w / 2,
    y: pos.top() + h / 2,
    layouts: [ Layout.southmiddle, Layout.northmiddle ]
  };
};

// Similar to dropdown.
var schema = [
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
];

var partTypes = [
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
];

export default <any> {
  name: Fun.constant('TouchMenu'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};