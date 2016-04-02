configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce/imagetoolsplugin/Demo', '../../src/demo/js', function(id) {return id.replace(/^tinymce\/imagetoolsplugin\//, '')})
  ]
});
