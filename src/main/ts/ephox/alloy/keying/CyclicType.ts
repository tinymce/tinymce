import { AlloyComponent } from '../api/component/ComponentApi';
import * as TabbingTypes from './TabbingTypes';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import { SugarEvent } from '../alien/TypeDefinitions';
import { EventFormat, SimulatedEvent } from '../events/SimulatedEvent';
import { AlloyEventHandler } from '../api/events/AlloyEvents';

export default TabbingTypes.create(
  FieldSchema.state('cyclic', Fun.constant(true))
);