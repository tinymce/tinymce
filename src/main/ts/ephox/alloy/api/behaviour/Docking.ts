import Behaviour from './Behaviour';
import ActiveDocking from '../../behaviour/docking/ActiveDocking';
import DockingSchema from '../../behaviour/docking/DockingSchema';

export default <any> Behaviour.create({
  fields: DockingSchema,
  name: 'docking',
  active: ActiveDocking
});