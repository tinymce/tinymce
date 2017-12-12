import Behaviour from './Behaviour';
import ActivePosition from '../../behaviour/positioning/ActivePosition';
import PositionApis from '../../behaviour/positioning/PositionApis';
import PositionSchema from '../../behaviour/positioning/PositionSchema';



export default <any> Behaviour.create({
  fields: PositionSchema,
  name: 'positioning',
  active: ActivePosition,
  apis: PositionApis
});