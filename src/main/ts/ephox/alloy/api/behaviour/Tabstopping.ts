import * as Behaviour from './Behaviour';
import * as ActiveTabstopping from '../../behaviour/tabstopping/ActiveTabstopping';
import TabstopSchema from '../../behaviour/tabstopping/TabstopSchema';

export interface TabstoppingBehaviour extends Behaviour.AlloyBehaviour {
  config: (TabstoppingConfig) => { key: string, value: any };
}
export interface TabstoppingConfig extends Behaviour.AlloyBehaviourConfig {
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