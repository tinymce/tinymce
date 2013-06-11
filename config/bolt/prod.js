configure({
  sources: [
    source('amd', 'ephox.robin', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox.boss', '../../../boss/src/main/js', mapper.hierarchical),
    source('amd', 'ephox.phoenix', '../../../phoenix/src/main/js', mapper.hierarchical),
    source('amd', 'ephox.polaris', '../../../polaris/src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});
