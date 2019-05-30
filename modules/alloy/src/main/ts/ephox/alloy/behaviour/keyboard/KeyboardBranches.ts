import AcyclicType from '../../keying/AcyclicType';
import CyclicType from '../../keying/CyclicType';
import ExecutionType from '../../keying/ExecutionType';
import FlatgridType from '../../keying/FlatgridType';
import FlowType from '../../keying/FlowType';
import MatrixType from '../../keying/MatrixType';
import MenuType from '../../keying/MenuType';
import SpecialType from '../../keying/SpecialType';

import { FieldProcessorAdt } from '@ephox/boulder';

const acyclic = AcyclicType.schema();
const cyclic = CyclicType.schema();
const flow = FlowType.schema();
const flatgrid = FlatgridType.schema();
const matrix = MatrixType.schema();
const execution = ExecutionType.schema();
const menu = MenuType.schema();
const special = SpecialType.schema();

export {
  acyclic,
  cyclic,
  flow,
  flatgrid,
  matrix,
  execution,
  menu,
  special
};