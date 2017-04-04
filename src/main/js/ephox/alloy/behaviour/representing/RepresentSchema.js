define(
  'ephox.alloy.behaviour.representing.RepresentSchema',

  [
    'ephox.alloy.behaviour.representing.DatasetStore',
    'ephox.alloy.behaviour.representing.ManualStore',
    'ephox.alloy.behaviour.representing.MemoryStore',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (DatasetStore, ManualStore, MemoryStore, FieldSchema, ValueSchema) {
    return [
      FieldSchema.defaultedOf('store', { mode: 'memory' }, ValueSchema.choose('mode', {
        memory: MemoryStore,
        manual: ManualStore,
        dataset: DatasetStore
      }))
    ];
  }
);