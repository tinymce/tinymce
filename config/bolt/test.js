configure({
  sources: [
    source('amd', 'ephox.echo.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.agar', '../../lib/test', mapper.flat)
  ]
});
