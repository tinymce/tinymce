configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce/wordcountplugin/Demo', '../../src/demo/js', function(id) {return id.replace(/^tinymce\/wordcountplugin\//, '')})
  ]
});