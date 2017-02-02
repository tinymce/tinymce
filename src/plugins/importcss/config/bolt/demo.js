configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.importcss.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/importcss\//, '');
		})
  ]
});

