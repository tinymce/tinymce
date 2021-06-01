import { ValueProcessorTypes } from '@ephox/boulder';

import DragStarting from '../../dragging/dragndrop/DragStarting';
import Dropping from '../../dragging/dragndrop/Dropping';

const ex: {
  drag: ValueProcessorTypes[];
  drop: ValueProcessorTypes[];
} = {
  drag: DragStarting,
  drop: Dropping
};

export default ex;
