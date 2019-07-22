import AcyclicType from '../../keying/AcyclicType';
import CyclicType from '../../keying/CyclicType';
import ExecutionType from '../../keying/ExecutionType';
import FlatgridType from '../../keying/FlatgridType';
import FlowType from '../../keying/FlowType';
import MatrixType from '../../keying/MatrixType';
import MenuType from '../../keying/MenuType';
import SpecialType from '../../keying/SpecialType';
import { ValueSchema } from '@ephox/boulder';

const acyclic = ValueSchema.objOf(AcyclicType.schema());
const cyclic = ValueSchema.objOf(CyclicType.schema());
const flow = ValueSchema.objOf(FlowType.schema());
const flatgrid = ValueSchema.objOf(FlatgridType.schema());
const matrix = ValueSchema.objOf(MatrixType.schema());
const execution = ValueSchema.objOf(ExecutionType.schema());
const menu = ValueSchema.objOf(MenuType.schema());
const special = ValueSchema.objOf(SpecialType.schema());

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
