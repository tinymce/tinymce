configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.hr.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/hr\//, '');
		})
  ]
});

