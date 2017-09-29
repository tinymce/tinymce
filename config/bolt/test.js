configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.alloy.test', '../../node_modules/@ephox', mapper.repo('src/test/js/module', mapper.hierarchical)),
  ]
})
