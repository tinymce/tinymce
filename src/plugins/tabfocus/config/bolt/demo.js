configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.tabfocus.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/tabfocus\//, '');
		})
  ]
});

