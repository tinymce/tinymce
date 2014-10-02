(function() {
	module("tinymce.util.Color");

	var Color = tinymce.util.Color;
	
	test("Constructor", function() {
		equal(new Color().toHex(), '#000000');
		equal(new Color('#faebcd').toHex(), '#faebcd');
	});

	test("parse method", function() {
		var color = new Color();

		equal(color.parse('#faebcd').toHex(), '#faebcd');
		equal(color.parse('#ccc').toHex(), '#cccccc');
		equal(color.parse(' #faebcd ').toHex(), '#faebcd');
		equal(color.parse('rgb(255,254,253)').toHex(), '#fffefd');
		equal(color.parse(' rgb ( 255 , 254 , 253 ) ').toHex(), '#fffefd');
		equal(color.parse({r: 255, g: 254, b: 253}).toHex(), '#fffefd');
		equal(color.parse({h: 359, s: 50, v: 50}).toHex(), '#804041');
		equal(color.parse({r: 700, g: 700, b: 700}).toHex(), '#ffffff');
		equal(color.parse({r: -1, g: -10, b: -20}).toHex(), '#000000');
	});

	test("toRgb method", function() {
		deepEqual(new Color('#faebcd').toRgb(), {r: 250, g: 235, b: 205});
	});

	test("toHsv method", function() {
		deepEqual(new Color('#804041').toHsv(), {h: 359, s: 50, v: 50});
	});

	test("toHex method", function() {
		equal(new Color({r: 255, g: 254, b: 253}).toHex(), '#fffefd');
	});
})();
