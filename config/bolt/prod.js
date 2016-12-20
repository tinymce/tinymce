configure({
  sources: [
    source('amd', 'ephox.katamari', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
