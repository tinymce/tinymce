import * as Behaviour from './Behaviour';
import * as ActiveTabstopping from '../../behaviour/tabstopping/ActiveTabstopping';
import TabstopSchema from '../../behaviour/tabstopping/TabstopSchema';

export interface TabstoppingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: TabstoppingConfig) => Behaviour.NamedConfiguredBehaviour;
}
export interface TabstoppingConfig {
  // intentionally blank
}

const Tabstopping = Behaviour.create({
  fields: TabstopSchema,
  name: 'tabstopping',
  active: ActiveTabstopping
}) as TabstoppingBehaviour;

export {
  Tabstopping
};