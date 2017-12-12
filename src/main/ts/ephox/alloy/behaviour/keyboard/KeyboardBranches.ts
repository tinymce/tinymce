import AcyclicType from '../../keying/AcyclicType';
import CyclicType from '../../keying/CyclicType';
import ExecutionType from '../../keying/ExecutionType';
import FlatgridType from '../../keying/FlatgridType';
import FlowType from '../../keying/FlowType';
import MatrixType from '../../keying/MatrixType';
import MenuType from '../../keying/MenuType';
import SpecialType from '../../keying/SpecialType';



export default <any> {
  acyclic: AcyclicType.schema(),
  cyclic: CyclicType.schema(),
  flow: FlowType.schema(),
  flatgrid: FlatgridType.schema(),
  matrix: MatrixType.schema(),
  execution: ExecutionType.schema(),
  menu: MenuType.schema(),
  special: SpecialType.schema()
};