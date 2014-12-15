module("tinymce.util.I18n");

test("Translate strings", function() {
	tinymce.util.I18n.add("code", {
		"text": "text translation",
		"value:{0}{1}": "value translation:{0}{1}",
		"text{context:something}": "text translation with context",
		"value:{0}{1}{context:something}": "value translation:{0}{1} with context"
	});

	equal(tinymce.util.I18n.translate("text"), "text translation");
	equal(tinymce.util.I18n.translate("untranslated text"), "untranslated text");
	equal(tinymce.util.I18n.translate(["untranslated value:{0}{1}", "a", "b"]), "untranslated value:ab");
	equal(tinymce.util.I18n.translate(["value:{0}{1}", "a", "b"]), "value translation:ab");
	equal(tinymce.util.I18n.translate("untranslated text{context:context}"), "untranslated text");
	equal(tinymce.util.I18n.translate(["untranslated value:{0}{1}{context:something}", "a", "b"]), "untranslated value:ab");
	equal(tinymce.util.I18n.translate(["value:{0}{1}{context:something}", "a", "b"]), "value translation:ab with context");
});