configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.legacyoutput.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/legacyoutput\//, '');
		})
  ]
});

