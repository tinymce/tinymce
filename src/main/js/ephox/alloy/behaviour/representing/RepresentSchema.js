import DatasetStore from './DatasetStore';
import ManualStore from './ManualStore';
import MemoryStore from './MemoryStore';
import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';



export default <any> [
  FieldSchema.defaultedOf('store', { mode: 'memory' }, ValueSchema.choose('mode', {
    memory: MemoryStore,
    manual: ManualStore,
    dataset: DatasetStore
  })),
  Fields.onHandler('onSetValue'),
  FieldSchema.defaulted('resetOnDom', false)
];