import { FieldProcessor } from '@ephox/boulder';

import DragStarting from '../../dragging/dragndrop/DragStarting';
import Dropping from '../../dragging/dragndrop/Dropping';

const ex: {
  drag: FieldProcessor[];
  drop: FieldProcessor[];
} = {
  drag: DragStarting,
  drop: Dropping
};

export default ex;
