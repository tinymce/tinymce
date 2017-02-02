configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.pagebreak.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/pagebreak\//, '');
		})
  ]
});

