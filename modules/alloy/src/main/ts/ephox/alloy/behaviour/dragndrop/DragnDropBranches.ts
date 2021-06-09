import { ValueProcessor } from '@ephox/boulder';

import DragStarting from '../../dragging/dragndrop/DragStarting';
import Dropping from '../../dragging/dragndrop/Dropping';

const ex: {
  drag: ValueProcessor[];
  drop: ValueProcessor[];
} = {
  drag: DragStarting,
  drop: Dropping
};

export default ex;
