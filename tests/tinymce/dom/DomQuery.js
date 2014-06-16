(function() {
	module("tinymce.dom.DomQuery", {
		teardown: function() {
			document.getElementById('view').innerHTML = '';
		}
	});

	function addTests(name, $) {
		test(name + ': Constructor HTML', function() {
			var $html;

			$html = $('<b>a</b><i>b</i>');
			equal($html.length, 2);
			equal($html[0].tagName, 'B');
			equal($html[1].tagName, 'I');
		});

		test(name + ': Constructor HTML with attributes', function() {
			var $html;

			$html = $('<b>', {id: 'id', title: 'title'});
			equal($html.length, 1);
			equal($html[0].tagName, 'B');
			equal($html[0].getAttribute('id'), 'id');
			equal($html[0].getAttribute('title'), 'title');
		});

		test(name + ': Constructor selector', function() {
			var $selector;

			$selector = $('#view');
			equal($selector.length, 1);
			equal($selector.selector, '#view');
			strictEqual($selector.context, document);
		});

		test(name + ': Constructor selector and context', function() {
			var $selector;

			$selector = $('#view', document);
			equal($selector.length, 1);
			equal($selector.selector, '#view');
			strictEqual($selector.context, document);
		});

		test(name + ': Constructor array', function() {
			var $html;

			$html = $([document.getElementById('view'), document.body]);
			equal($html.length, 2);
			equal($html[0].tagName, 'DIV');
			equal($html[1].tagName, 'BODY');
		});

		test(name + ': Constructor query instance', function() {
			var $clone;

			$clone = $($('#view'));
			equal($clone.length, 1);
			equal($clone[0].tagName, 'DIV');
		});

		test(name + ': static extend', function() {
			var data;

			deepEqual($.extend({a: 1, b: 1}, {b: 2, c: 2}), {a: 1, b: 2, c: 2});
			deepEqual($.extend({a: 1, b: 1}, {b: 2, c: 2}, {c: 3, d: 3}), {a: 1, b: 2, c: 3, d: 3});

			data = {a: 1, b: 1};
			ok(data === $.extend(data, {b: 2, c: 2}, {c: 3, d: 3}), {a: 1, b: 2, c: 3, d: 3});
		});

		test(name + ': static makeArray', function() {
			deepEqual($.makeArray({'0': 'a', '1': 'b', length: 2}), ['a', 'b']);
		});

		test(name + ': static inArray', function() {
			deepEqual($.inArray(1, [1, 2]), 0);
			deepEqual($.inArray(2, [1, 2]), 1);
			deepEqual($.inArray(3, [1, 2]), -1);
		});

		test(name + ': static isArray', function() {
			ok($.isArray([]));
			ok(!$.isArray({}));
		});

		test(name + ': static each', function() {
			var data;

			data = '';
			$.each([1, 2, 3], function(key, value) {
				data += '' + value + key;
			});

			equal(data, '102132');

			data = '';
			$.each({a: 1, b: 2, c: 3}, function(key, value) {
				data += '' + value + key;
			});

			equal(data, '1a2b3c');

			data = '';
			$.each([1, 2, 3], function(key, value) {
				data += '' + value + key;

				if (value == 2) {
					return false;
				}
			});

			equal(data, '1021');
		});

		test(name + ': static trim', function() {
			equal($.trim(' a '), 'a');
			equal($.trim('a '), 'a');
			equal($.trim(' a'), 'a');
		});

		test(name + ': static unique', function() {
			var nodes;

			nodes = $.unique([document.getElementById('view'), document.getElementById('view'), document.body]);
			equal(nodes.length, 2);
			equal(nodes[0].tagName, 'BODY');
			equal(nodes[1].tagName, 'DIV');
		});

		test(name + ': toArray', function() {
			ok($.isArray($('#view').toArray()));
			equal($('#view').toArray().length, 1);
		});

		test(name + ': add single element', function() {
			var $nodes = $('#view').add(document.body);
			equal($nodes.length, 2);
			equal($nodes[0].tagName, 'BODY');
			equal($nodes[1].tagName, 'DIV');
		});

		test(name + ': add multiple elements (duplicates)', function() {
			var $nodes = $('#view,#view').add([document.body, document.body]);
			equal($nodes.length, 2);
			equal($nodes[0].tagName, 'BODY');
			equal($nodes[1].tagName, 'DIV');
		});

		test(name + ': add multiple elements (non duplicates)', function() {
			var $nodes = $('#view').add([$('<b/>')[0], $('<i/>')[0]]);
			equal($nodes.length, 3);
			equal($nodes[0].tagName, 'DIV');
			equal($nodes[1].tagName, 'B');
			equal($nodes[2].tagName, 'I');
		});

		test(name + ': add selector', function() {
			var $nodes = $().add('#view');
			equal($nodes.length, 1);
			equal($nodes[0].tagName, 'DIV');
		});

		test(name + ': attr set/get attr on element', function() {
			var $elm;

			$elm = $('<b/>').attr('id', 'x');
			equal($elm.attr('id'), 'x');
			equal(typeof $elm.attr('noattr'), 'undefined');

			$elm = $('<b/>').attr('id', null);
			equal(typeof $elm.attr('id'), 'undefined');

			$elm = $('<b/>').attr('id', 1);
			strictEqual($elm.attr('id'), '1');
		});

		test(name + ': attr set/get attrs on element', function() {
			var $elm;

			$elm = $('<b/>').attr({id: 'x', title: 'y'});
			equal($elm.attr('id'), 'x');
			equal($elm.attr('title'), 'y');
		});

		test(name + ': attr set/get attr function on element', function() {
			var $elm;

			$elm = $('<b id="a" />').attr('id', function(i, value) {return i + value;});
			equal($elm.attr('id'), '0a');
		});

		test(name + ': attr set/get on non element', function() {
			var $elm;

			$elm = $([document.createTextNode('x')]).attr('id', 'x');
			equal(typeof $elm.attr('id'), 'undefined');
		});

		test(name + ': removeAttr on element', function() {
			var $elm;

			$elm = $('<b id="a" />').removeAttr('id');
			equal(typeof $elm.attr('id'), 'undefined');

			$elm = $([document.createTextNode('x')]).removeAttr('id');
			equal(typeof $elm.attr('id'), 'undefined');
		});

		test(name + ': css get/set single item on element', function() {
			var $elm;

			$elm = $('<b />').appendTo('#view').css('font-size', 42);
			equal($elm.css('font-size'), '42px');

			$elm = $('<b />').appendTo('#view').css('fontSize', 42);
			equal($elm.css('fontSize'), '42px');
		});

		test(name + ': css get/set items on element', function() {
			var $elm;

			$elm = $('<b>x</b>').appendTo('#view').css({'font-size': 42, 'text-indent': 42});
			equal($elm.css('font-size'), '42px');
			equal($elm.css('text-indent'), '42px');
		});

		test(name + ': remove single element', function() {
			var $elm;

			$elm = $('<b>x</b>').appendTo('#view').remove();
			strictEqual($elm[0].parentNode, null);
		});

		test(name + ': remove multiple elements', function() {
			var $elm;

			$elm = $('<b>x</b><em>x</em>').appendTo('#view').remove();
			strictEqual($elm[0].parentNode, null);
			strictEqual($elm[1].parentNode, null);
		});

		test(name + ': remove unappended element', function() {
			var $elm;

			$elm = $('<b>x</b>').remove();
			strictEqual($elm[0].parentNode, null);
		});

		test(name + ': empty single element', function() {
			var $elm;

			$elm = $('<b><i>x<i>y</b>').empty();
			strictEqual($elm[0].firstChild, null);
		});

		test(name + ': html set on single element', function() {
			var $elm;

			$elm = $('<b></b>').html('<i>x</i>');
			strictEqual($elm[0].firstChild.tagName, 'I');
		});

		test(name + ': html get on element/elements', function() {
			strictEqual($('<b><i>x</i></b>').html().toLowerCase(), '<i>x</i>');
			strictEqual($('<b><i>x</i></b><i>a</i>').html().toLowerCase(), '<i>x</i>');
		});

		test(name + ': text set on single element', function() {
			var $elm;

			$elm = $('<b></b>').text('<i>x</i>');
			strictEqual($elm[0].firstChild.data, '<i>x</i>');
		});

		test(name + ': text get on element', function() {
			strictEqual($('<b><i>x</i>y</b>').text().toLowerCase(), 'xy');
		});
	}

	// Run tests against jQuery/DomQuery so we know that we are compatible
	addTests('DomQuery', tinymce.dom.DomQuery);
	addTests('jQuery', jQuery);
})();
