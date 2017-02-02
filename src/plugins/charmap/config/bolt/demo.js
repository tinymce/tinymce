configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.charmap.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/charmap\//, '');
		})
  ]
});

