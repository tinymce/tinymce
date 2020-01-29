import * as Behaviour from './Behaviour';
import * as ActiveTabstopping from '../../behaviour/tabstopping/ActiveTabstopping';
import TabstopSchema from '../../behaviour/tabstopping/TabstopSchema';
import { TabstoppingBehaviour } from '../../behaviour/tabstopping/TabstoppingTypes';

const Tabstopping: TabstoppingBehaviour = Behaviour.create({
  fields: TabstopSchema,
  name: 'tabstopping',
  active: ActiveTabstopping
});

export {
  Tabstopping
};
