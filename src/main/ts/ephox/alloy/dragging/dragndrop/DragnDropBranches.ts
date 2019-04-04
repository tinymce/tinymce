import { FieldProcessorAdt } from '@ephox/boulder';
import DragStarting from './DragStarting';
import Dropping from './Dropping';

const ex: {
  drag: FieldProcessorAdt[];
  drop: FieldProcessorAdt[];
} = {
  drag: DragStarting,
  drop: Dropping
};

export default ex;