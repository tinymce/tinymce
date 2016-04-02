configure({
  sources: [
    source('amd', 'ephox/imagetools', '../../../../../../node_modules/@ephox/imagetools/src/main/js', mapper.hierarchical),
		source('amd', 'tinymce/imagetoolsplugin', '../../src/main/js', function(id) {return id.replace(/^tinymce\/imagetoolsplugin\//, '');})
  ]
});
