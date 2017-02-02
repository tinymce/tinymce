configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.table.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/table\//, '');
		})
  ]
});