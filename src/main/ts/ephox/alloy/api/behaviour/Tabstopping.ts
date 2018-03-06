import * as Behaviour from './Behaviour';
import * as ActiveTabstopping from '../../behaviour/tabstopping/ActiveTabstopping';
import TabstopSchema from '../../behaviour/tabstopping/TabstopSchema';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';

export interface TabstoppingBehaviour extends AlloyBehaviour {
  config: (TabstoppingConfig) => { key: string, value: any };
}
export interface TabstoppingConfig extends AlloyBehaviourConfig {
  // intentionally blank
}

const Tabstopping: TabstoppingBehaviour = Behaviour.create({
  fields: TabstopSchema,
  name: 'tabstopping',
  active: ActiveTabstopping
});

export {
  Tabstopping
};