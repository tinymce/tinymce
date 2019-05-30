import { FieldProcessorAdt } from '@ephox/boulder';
import DragStarting from '../../dragging/dragndrop/DragStarting';
import Dropping from '../../dragging/dragndrop/Dropping';

const ex: {
  drag: FieldProcessorAdt[];
  drop: FieldProcessorAdt[];
} = {
  drag: DragStarting,
  drop: Dropping
};

export default ex;