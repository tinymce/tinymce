test('atomic.core.StringMapperTest', [
	'tinymce.wordcount.text.StringMapper'
], function (StringMapper) {
	// What it all means:
	// ALETTER: 0,
	// MIDNUMLET: 1,
	// MIDLETTER: 2,
	// MIDNUM: 3,
	// NUMERIC: 4,
	// CR: 5,
	// LF: 6,
	// NEWLINE: 7,
	// EXTEND: 8,
	// FORMAT: 9,
	// KATAKANA: 10,
	// EXTENDNUMLET: 11,
	// OTHER: 12

	assert.eq([0, 0, 0], StringMapper("abc"));
	assert.eq([0, 0, 0], StringMapper("åäö"));
	assert.eq([0, 4, 0], StringMapper("a2c"));
	assert.eq([0, 1, 0, 0, 12, 0, 0, 0, 0, 0], StringMapper("a'la carte"));
	assert.eq([0, 0, 0, 12, 6, 12, 0, 0, 0], StringMapper("one \n two"));
	assert.eq([4, 3, 4, 4, 4, 1, 4, 4], StringMapper("3,500.10"));
	assert.eq([12, 10, 10], StringMapper('愛ラブ'));
	assert.eq([12, 12], StringMapper('ねこ'));


});