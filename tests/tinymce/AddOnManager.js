module("tinymce.AddOnManager", {
	teardown: function() {
		Utils.unpatch(tinymce.dom.ScriptLoader.ScriptLoader);
		tinymce.AddOnManager.languageLoad = true;
		tinymce.AddOnManager.language = 'en';
	}
});

test('requireLangPack', function() {
	var languagePackUrl;

	Utils.patch(tinymce.dom.ScriptLoader.ScriptLoader, 'add', function(origFunc, url) {
		languagePackUrl = url;
	});

	function getLanguagePackUrl(language, languages) {
		languagePackUrl = null;
		tinymce.AddOnManager.language = language;
		tinymce.AddOnManager.PluginManager.requireLangPack('plugin', languages);
		return languagePackUrl;
	}

	tinymce.AddOnManager.PluginManager.urls.plugin = '/root';

	equal(getLanguagePackUrl('sv_SE'), '/root/langs/sv_SE.js');
	equal(getLanguagePackUrl('sv_SE', 'sv,en,us'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv_SE', 'sv_SE,en_US'), '/root/langs/sv_SE.js');
	equal(getLanguagePackUrl('sv'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv', 'sv'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv', 'sv,en,us'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv', 'en,sv,us'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv', 'en,us,sv'), '/root/langs/sv.js');
	strictEqual(getLanguagePackUrl('sv', 'en,us'), null);
	strictEqual(getLanguagePackUrl(null, 'en,us'), null);
	strictEqual(getLanguagePackUrl(null), null);

	tinymce.AddOnManager.languageLoad = false;
	strictEqual(getLanguagePackUrl('sv', 'sv'), null);
});
