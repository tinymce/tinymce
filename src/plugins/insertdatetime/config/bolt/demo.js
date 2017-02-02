configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.insertdatetime.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/insertdatetime\//, '');
		})
  ]
});

