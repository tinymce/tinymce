import * as Behaviour from './Behaviour';
import * as ActiveTabstopping from '../../behaviour/tabstopping/ActiveTabstopping';
import TabstopSchema from '../../behaviour/tabstopping/TabstopSchema';
import { TabstoppingBehaviour } from 'ephox/alloy/behaviour/tabstopping/TabstoppingTypes';


const Tabstopping = Behaviour.create({
  fields: TabstopSchema,
  name: 'tabstopping',
  active: ActiveTabstopping
}) as TabstoppingBehaviour;

export {
  Tabstopping
};