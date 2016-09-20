module("tinymce.util.I18n", {
	teardown: function() {
		tinymce.util.I18n.rtl = false;
	}
});

test("Translate strings", function() {
	var undef;
	var translate = tinymce.util.I18n.translate;

	tinymce.util.I18n.add("code", {
		"text": "text translation",
		"value:{0}{1}": "value translation:{0}{1}",
		"text{context:something}": "text translation with context",
		"value:{0}{1}{context:something}": "value translation:{0}{1} with context",
		"empty string": ""
	});

	equal(translate("text"), "text translation");
	equal(translate("untranslated text"), "untranslated text");
	equal(translate(["untranslated value:{0}{1}", "a", "b"]), "untranslated value:ab");
	equal(translate(["value:{0}{1}", "a", "b"]), "value translation:ab");
	equal(translate("untranslated text{context:context}"), "untranslated text");
	equal(translate(["untranslated value:{0}{1}{context:something}", "a", "b"]), "untranslated value:ab");
	equal(translate(["value:{0}{1}{context:something}", "a", "b"]), "value translation:ab with context");

	// check if translate survives some awkward cases
	deepEqual(translate("empty string"), "");
	equal(translate(["untranslated value:{0}{1}", "a"]), "untranslated value:a{1}",
		"Do not strip tokens that weren't replaced.");

	equal(translate([{}]), "[object Object]");
	equal(translate(function(){}), "[object Function]");

	equal(translate(null), "");
	equal(translate(0), 0, "0");
	equal(translate(true), "true", "true");
	equal(translate(false), "false", "false");

	equal(translate({}), "[object Object]", "[object Object]");
	equal(translate({raw:""}), "", "empty string");
	equal(translate({raw:false}), "false", "false");
	equal(translate({raw:undef}), "");
	equal(translate({raw:null}), "");

	// https://github.com/tinymce/tinymce/issues/3029
	equal(translate("hasOwnProperty"), "hasOwnProperty");
	tinymce.util.I18n.add("code", {
		"hasOwnProperty": "good"
	});
	equal(translate("hasOwnProperty"), "good");

});

test("Switch language", function() {
	for (var key in tinymce.util.I18n.data) {
		delete tinymce.util.I18n.data[key];
	}

	tinymce.util.I18n.add("code1", {
		"text": "translation1"
	});

	equal(tinymce.util.I18n.getCode(), "code1");
	strictEqual(tinymce.util.I18n.rtl, false);
	deepEqual(tinymce.util.I18n.data, {
		"code1": {
			"text": "translation1"
		}
	 });

	tinymce.util.I18n.add("code2", {
		"_dir": "rtl",
		"text": "translation2"
	});

	equal(tinymce.util.I18n.getCode(), "code2");
	strictEqual(tinymce.util.I18n.rtl, true);
	deepEqual(tinymce.util.I18n.data, {
		"code1": {
			"text": "translation1"
		},

		"code2": {
			"_dir": "rtl",
			"text": "translation2"
		}
	 });
});
