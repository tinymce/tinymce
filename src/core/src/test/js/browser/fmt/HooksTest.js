asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	"tinymce/fmt/Hooks"
], function (LegacyUnit, Pipeline, Hooks) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	module("tinymce.fmt.Hooks", {
		setupModule: function () {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				init_instance_callback: function (ed) {
					editor = ed;
					QUnit.start();
				}
			});
		}
	});

	suite.test('pre - postProcessHook', function () {
		function assertPreHook (setupHtml, setupSelection, expected) {
			editor.getBody().innerHTML = setupHtml;
			Utils.setSelection.apply(Utils, setupSelection);
			Hooks.postProcess('pre', editor);
			LegacyUnit.equal(editor.getContent(), expected);
		}

		assertPreHook(
			'<pre>a</pre><pre>b</pre>',
			['pre:nth-child(1)', 0, 'pre:nth-child(2)', 1],
			'<pre>a<br /><br />b</pre>'
		);

		assertPreHook(
			'<pre>a</pre><pre>b</pre>',
			['pre:nth-child(2)', 0, 'pre:nth-child(2)', 1],
			'<pre>a</pre><pre>b</pre>'
		);

		assertPreHook(
			'<pre>a</pre><pre>b</pre>',
			['pre:nth-child(2)', 1, 'pre:nth-child(2)', 1],
			'<pre>a</pre><pre>b</pre>'
		);

		assertPreHook(
			'<pre>a</pre><pre>b</pre><pre>c</pre>',
			['pre:nth-child(1)', 0, 'pre:nth-child(3)', 1],
			'<pre>a<br /><br />b<br /><br />c</pre>'
		);

		assertPreHook(
			'<pre>a</pre><pre>b</pre>',
			['pre:nth-child(1)', 0, 'pre:nth-child(1)', 1],
			'<pre>a</pre><pre>b</pre>'
		);

		assertPreHook(
			'<pre>a</pre><p>b</p><pre>c</pre>',
			['pre:nth-child(1)', 0, 'pre:nth-child(3)', 1],
			'<pre>a</pre><p>b</p><pre>c</pre>'
		);

		assertPreHook(
			'<pre>a</pre><pre>b</pre><p>c</p><pre>d</pre><pre>e</pre>',
			['pre:nth-child(1)', 0, 'pre:nth-child(5)', 1],
			'<pre>a<br /><br />b</pre><p>c</p><pre>d<br /><br />e</pre>'
		);
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});
