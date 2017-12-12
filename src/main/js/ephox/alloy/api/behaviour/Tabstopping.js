import Behaviour from './Behaviour';
import ActiveTabstopping from '../../behaviour/tabstopping/ActiveTabstopping';
import TabstopSchema from '../../behaviour/tabstopping/TabstopSchema';



export default <any> Behaviour.create({
  fields: TabstopSchema,
  name: 'tabstopping',
  active: ActiveTabstopping
});