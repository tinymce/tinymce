module("tinymce.util.JSON");

test('serialize', 2, function() {
	equal(
		tinymce.util.JSON.serialize({
			arr1 : [1, 2, 3, [1, 2, 3]],
			bool1 : true,
			float1: 3.14,
			int1 : 123,
			null1 : null,
			obj1 : {key1 : "val1", key2 : "val2"}, str1 : '\"\'abc\u00C5123\\'}
		),
		'{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,"obj1":{"key1":"val1","key2":"val2"},"str1":"\\"\'abc\\u00c5123\\\\"}'
	);

	equal(
		tinymce.util.JSON.serialize({
			arr1 : [1, 2, 3, [1, 2, 3]],
			bool1 : true,
			float1: 3.14,
			int1 : 123,
			null1 : null,
			obj1 : {key1 : "val1", key2 : "val2"}, str1 : '\"\'abc\u00C5123'}, "'"
		),
		"{'arr1':[1,2,3,[1,2,3]],'bool1':true,'float1':3.14,'int1':123,'null1':null,'obj1':{'key1':'val1','key2':'val2'},'str1':'\\\"\\'abc\\u00c5123'}"
	);
});

test('parse', 1, function() {
	equal(tinymce.util.JSON.parse('{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,"obj1":{"key1":"val1","key2":"val2"},"str1":"abc\\u00c5123"}').str1, 'abc\u00c5123');
});
