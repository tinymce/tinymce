(function() {
	var $elm;

	module("tinymce.dom.DomQuery", {
		teardown: function() {
			if ($elm) {
				$elm.off();
				$elm = null;
			}

			document.getElementById('view').innerHTML = '';
		}
	});

	function normalizeParentNode(parentNode) {
		// IE 8 will return a document fragment as it's parent when nodes are removed
		if (parentNode && parentNode.nodeType == 11) {
			return null;
		}

		return parentNode;
	}

	function normalizeStyleValue(value) {
		if (typeof value == 'string') {
			return value.toLowerCase().replace(/\s+/g, ' ').replace(/;\s*$/, '');
		}

		return value;
	}

	function splitAtView(nodes) {
		nodes.each(function(i) {
			if (this.id == 'view') {
				nodes = nodes.slice(0, i);
				return false;
			}
		});

		return nodes;
	}

	function addTests(prefix, $) {
		test(prefix + 'Constructor HTML', function() {
			var $html;

			$html = $('<b>a</b><i>b</i>');
			equal($html.length, 2);
			equal($html[0].tagName, 'B');
			equal($html[1].tagName, 'I');
		});

		test(prefix + 'Constructor HTML with attributes', function() {
			var $html;

			$html = $('<b>', {id: 'id', title: 'title'});
			equal($html.length, 1);
			equal($html[0].tagName, 'B');
			equal($html[0].getAttribute('id'), 'id');
			equal($html[0].getAttribute('title'), 'title');
		});

		test(prefix + 'Constructor selector', function() {
			var $selector;

			$selector = $('#view');
			equal($selector.length, 1);
			equal($selector.selector, '#view');
			strictEqual($selector.context, document);
		});

		test(prefix + 'Constructor selector and context', function() {
			var $selector;

			$selector = $('#view', document);
			equal($selector.length, 1);
			equal($selector.selector, '#view');
			strictEqual($selector.context, document);
		});

		test(prefix + 'Constructor selector and context', function() {
			$('#view').html('<div><b>a</b></div><div><b>b</b></div>');
			$('b', $('#view div')[0]).html('x');
			equal($('#view').html().toLowerCase().replace(/[\r\n]/g, ''), '<div><b>x</b></div><div><b>b</b></div>');
		});

		test(prefix + 'Constructor array', function() {
			var $html;

			$html = $([document.getElementById('view'), document.body]);
			equal($html.length, 2);
			equal($html[0].tagName, 'DIV');
			equal($html[1].tagName, 'BODY');
		});

		test(prefix + 'Constructor query instance', function() {
			var $clone;

			$clone = $($('#view'));
			equal($clone.length, 1);
			equal($clone[0].tagName, 'DIV');
		});

		test(prefix + 'Constructor window', function() {
			var $win;

			$win = $(window);
			equal($win.length, 1);
			strictEqual($win[0], window);
		});

		test(prefix + 'Constructor window', function() {
			var $elm;

			$elm = $(document.body);
			equal($elm.length, 1);
			strictEqual($elm[0], document.body);
		});

		test(prefix + 'static extend()', function() {
			var data;

			deepEqual($.extend({a: 1, b: 1}, {b: 2, c: 2}), {a: 1, b: 2, c: 2});
			deepEqual($.extend({a: 1, b: 1}, {b: 2, c: 2}, {c: 3, d: 3}), {a: 1, b: 2, c: 3, d: 3});

			data = {a: 1, b: 1};
			ok(data === $.extend(data, {b: 2, c: 2}, {c: 3, d: 3}), {a: 1, b: 2, c: 3, d: 3});
		});

		test(prefix + 'static makeArray()', function() {
			strictEqual($.makeArray(window)[0], window);
			deepEqual($.makeArray({'0': 'a', '1': 'b', length: 2}), ['a', 'b']);
		});

		test(prefix + 'static inArray()', function() {
			deepEqual($.inArray(1, [1, 2]), 0);
			deepEqual($.inArray(2, [1, 2]), 1);
			deepEqual($.inArray(3, [1, 2]), -1);
		});

		test(prefix + 'static grep()', function() {
			deepEqual($.grep([1, 2, 3], function(v) {
				return v > 1;
			}), [2, 3]);
		});

		test(prefix + 'static isArray()', function() {
			ok($.isArray([]));
			ok(!$.isArray({}));
		});

		test(prefix + 'static each()', function() {
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

		test(prefix + 'static trim()', function() {
			equal($.trim(' a '), 'a');
			equal($.trim('a '), 'a');
			equal($.trim(' a'), 'a');
		});

		test(prefix + 'static unique()', function() {
			var nodes;

			nodes = $.unique([document.getElementById('view'), document.getElementById('view'), document.body]);
			equal(nodes.length, 2);
			equal(nodes[0].tagName, 'BODY');
			equal(nodes[1].tagName, 'DIV');
		});

		test(prefix + 'toArray()', function() {
			ok($.isArray($('#view').toArray()));
			equal($('#view').toArray().length, 1);
		});

		test(prefix + 'add() single element', function() {
			var $nodes = $('#view').add(document.body);
			equal($nodes.length, 2);
			equal($nodes[0].tagName, 'BODY');
			equal($nodes[1].tagName, 'DIV');
		});

		test(prefix + 'add() multiple elements (duplicates)', function() {
			var $nodes = $('#view,#view').add([document.body, document.body]);
			equal($nodes.length, 2);
			equal($nodes[0].tagName, 'BODY');
			equal($nodes[1].tagName, 'DIV');
		});

		test(prefix + 'add() multiple elements (non duplicates)', function() {
			var $nodes = $('#view').add([$('<b/>')[0], $('<i/>')[0]]);
			equal($nodes.length, 3);
			equal($nodes[0].tagName, 'DIV');
			equal($nodes[1].tagName, 'B');
			equal($nodes[2].tagName, 'I');
		});

		test(prefix + 'add() selector', function() {
			var $nodes = $().add('#view');
			equal($nodes.length, 1);
			equal($nodes[0].tagName, 'DIV');
		});

		test(prefix + 'attr() set/get attr on element', function() {
			var $elm;

			$elm = $('<b/>').attr('id', 'x');
			equal($elm.attr('id'), 'x');
			equal(typeof $elm.attr('noattr'), 'undefined', 'Undefined attribute shouldn\'t have a value');

			$elm = $('<b/>').attr('attr', null);
			equal(typeof $elm.attr('attr'), 'undefined', 'Deleted attribute shouldn\'t have a value (1)');

			$elm = $('<b/>').attr('id', 1);
			strictEqual($elm.attr('id'), '1');
		});

		test(prefix + 'attr() set/get style attr on element (IE 7)', function() {
			$elm = $('<b style="font-size: 10px" />').attr('style', 'font-size: 43px');
			equal(normalizeStyleValue($elm.attr('style')), 'font-size: 43px');
		});

		test(prefix + 'attr() set/get checked attr on element (IE 7)', function() {
			$elm = $('<input type="checkbox" />').attr('checked', 'checked');
			equal($elm.attr('checked').toLowerCase(), 'checked');
		});

		test(prefix + 'attr() get special attrs on element (IE 7)', function() {
			$elm = $('<input type="checkbox" />');
			equal(typeof $elm.attr('maxlength'), 'undefined', 'Undefined maxlength');
			equal(typeof $elm.attr('size'), 'undefined', 'Undefined size');
			equal(typeof $elm.attr('checked'), 'undefined', 'Undefined checked');
			equal(typeof $elm.attr('readonly'), 'undefined', 'Undefined readonly');
			equal(typeof $elm.attr('disabled'), 'undefined', 'Undefined disabled');

			$elm = $('<input type="text" />');
			equal(typeof $elm.attr('maxlength'), 'undefined', 'Undefined maxlength');
			equal(typeof $elm.attr('size'), 'undefined', 'Undefined size');
			equal(typeof $elm.attr('checked'), 'undefined', 'Undefined checked');
			equal(typeof $elm.attr('readonly'), 'undefined', 'Undefined readonly');
			equal(typeof $elm.attr('disabled'), 'undefined', 'Undefined disabled');

			$elm = $('<input type="text" size="11" maxlength="21" disabled="disabled" />');
			equal($elm.attr('maxlength'), '21', 'maxlength');
			equal($elm.attr('size'), '11', 'size');
			equal($elm.attr('disabled'), 'disabled', 'disabled');

			$elm = $('<textarea></textarea>');
			equal(typeof $elm.attr('maxlength'), 'undefined', 'Undefined maxlength');
			equal(typeof $elm.attr('size'), 'undefined', 'Undefined size');
			equal(typeof $elm.attr('checked'), 'undefined', 'Undefined checked');
			equal(typeof $elm.attr('readonly'), 'undefined', 'Undefined readonly');
			equal(typeof $elm.attr('disabled'), 'undefined', 'Undefined disabled');

			$elm = $('<textarea readonly="readonly"></textarea>');
			equal($elm.attr('readonly'), 'readonly', 'readonly');
		});

		test(prefix + 'attr() set/get attrs on element', function() {
			var $elm;

			$elm = $('<b/>').attr({id: 'x', title: 'y'});
			equal($elm.attr('id'), 'x');
			equal($elm.attr('title'), 'y');
		});

		test(prefix + 'attr() set/get on non element', function() {
			var $elm;

			$elm = $([document.createTextNode('x')]).attr('id', 'x');
			equal(typeof $elm.attr('id'), 'undefined');
		});

		test(prefix + 'removeAttr() on element', function() {
			var $elm;

			$elm = $('<b attr="a" />').removeAttr('AttR');
			equal(typeof $elm.attr('attr'), 'undefined');

			$elm = $([document.createTextNode('x')]).removeAttr('id');
			equal(typeof $elm.attr('id'), 'undefined');
		});

		test(prefix + 'prop() set/get attr on element', function() {
			var $elm;

			$elm = $('<b/>').prop('id', 'x');
			equal($elm.prop('id'), 'x');
			equal(typeof $elm.prop('noprop'), 'undefined');

			$elm = $('<b class="x"/>');
			equal($elm.prop('class'), 'x');
			equal($elm.prop('className'), 'x');

			$elm = $('<label for="x"/>');
			equal($elm.prop('for'), 'x');
			equal($elm.prop('htmlFor'), 'x');
		});

		test(prefix + 'prop() set/get attrs on element', function() {
			var $elm;

			$elm = $('<b/>').prop({id: 'x', title: 'y'});
			equal($elm.prop('id'), 'x');
			equal($elm.prop('title'), 'y');
		});

		test(prefix + 'css() get/set single item on element', function() {
			var $elm;

			$elm = $('<b />').appendTo('#view').css('font-size', 42);
			equal($elm.css('font-size'), '42px');

			$elm = $('<b />').appendTo('#view').css('fontSize', 42);
			equal($elm.css('fontSize'), '42px');
		});

		test(prefix + 'css() get/set items on element', function() {
			var $elm;

			$elm = $('<b>x</b>').appendTo('#view').css({'font-size': 42, 'text-indent': 42});
			equal($elm.css('font-size'), '42px');
			equal($elm.css('text-indent'), '42px');
		});

		test(prefix + 'css() set opacity', function() {
			var styles = new tinymce.html.Styles();

			if (tinymce.Env.ie && tinymce.Env.ie < 9) {
				// jQuery has a slightly different output but basically the same
				deepEqual(styles.parse($('<b></b>').css('opacity', 0.5).attr('style')), {filter: 'alpha(opacity=50)', 'zoom': '1'});
				strictEqual(typeof $('<b></b>').css('opacity', null).attr('style'), 'undefined');
			} else {
				strictEqual(normalizeStyleValue($('<b></b>').css('opacity', 0.5).attr('style')), 'opacity: 0.5');
				ok(!$('<b></b>').css('opacity', null).attr('style'));
				ok(!$('<b></b>').css('opacity', '').attr('style'));
			}
		});

		test(prefix + 'css() set float', function() {
			strictEqual(normalizeStyleValue($('<b></b>').css('float', 'right').attr('style')), 'float: right');
			ok(!$('<b style="float: left"></b>').css('float', '').attr('style'));
			ok(!$('<b></b>').css('float', null).attr('style'));
		});

		test(prefix + 'remove() single element', function() {
			var $elm;

			$elm = $('<b>x</b>').appendTo('#view').remove();
			strictEqual(normalizeParentNode($elm[0].parentNode), null);
		});

		test(prefix + 'remove() multiple elements', function() {
			var $elm;

			$elm = $('<b>x</b><em>x</em>').appendTo('#view').remove();
			strictEqual(normalizeParentNode($elm[0].parentNode), null);
			strictEqual(normalizeParentNode($elm[1].parentNode), null);
		});

		test(prefix + 'remove() unappended element', function() {
			var $elm;

			$elm = $('<b>x</b>').remove();
			strictEqual(normalizeParentNode($elm[0].parentNode), null);
		});

		test(prefix + 'empty() single element', function() {
			var $elm;

			$elm = $('<b><i>x<i>y</b>').empty();
			strictEqual($elm[0].firstChild, null);
		});

		test(prefix + 'html() set on single element', function() {
			var $elm;

			$elm = $('<b></b>').html('<i>x</i>');
			strictEqual($elm[0].firstChild.tagName, 'I');
		});

		test(prefix + 'html() get on element/elements', function() {
			strictEqual($('<b><i>x</i></b>').html().toLowerCase(), '<i>x</i>');
			strictEqual($('<b><i>x</i></b><i>a</i>').html().toLowerCase(), '<i>x</i>');
		});

		/*
		test(prefix + 'html() set comment as first child (IE)', function() {
			$('#view').html('<!-- x -->y');
			strictEqual($('#view').html(), '<!-- x -->y');
		});
		*/

		test(prefix + 'html() set DIV as child of P (IE 8)', function() {
			$('<p></p>').appendTo('#view');
			$('#view p').html('<div>x</div>');
			strictEqual($('#view').html().toLowerCase().replace(/[\r\n]/g, ''), '<p><div>x</div></p>');
		});

		test(prefix + 'text() set on single element', function() {
			var $elm;

			$elm = $('<b></b>').text('<i>x</i>');
			strictEqual($elm[0].firstChild.data, '<i>x</i>');
		});

		test(prefix + 'text() get on element', function() {
			strictEqual($('<b><i>x</i>y</b>').text().toLowerCase(), 'xy');
		});

		test(prefix + 'append() to element', function() {
			var $elm;

			$elm = $('<b>a</b>');
			$elm.append($('<i>b</i>'));
			strictEqual($elm.html().toLowerCase(), 'a<i>b</i>');

			$elm = $('<b>a</b>');
			$elm.append('<i>b</i>');
			strictEqual($elm.html().toLowerCase(), 'a<i>b</i>');

			$elm = $('<b>a</b>');
			$elm.append('b');
			strictEqual($elm.html().toLowerCase(), 'ab');

			$elm = $('<b>a</b>');
			$elm.append($('<i>b</i><b>c</b>'));
			strictEqual($elm.html().toLowerCase(), 'a<i>b</i><b>c</b>');

			$elm = $('<b></b>');
			$elm.append($('<i>b</i>'));
			strictEqual($elm.html().toLowerCase(), '<i>b</i>');
		});

		test(prefix + 'prepend() to element', function() {
			var $elm;

			$elm = $('<b>a</b>');
			$elm.prepend($('<i>b</i>'));
			strictEqual($elm.html().toLowerCase(), '<i>b</i>a');

			$elm = $('<b>a</b>');
			$elm.prepend($('<i>b</i><b>c</b>'));
			strictEqual($elm.html().toLowerCase(), '<i>b</i><b>c</b>a');

			$elm = $('<b></b>');
			$elm.prepend($('<i>b</i>'));
			strictEqual($elm.html().toLowerCase(), '<i>b</i>');
		});

		test(prefix + 'before() element', function() {
			var $elm;

			$elm = $('<b><i>a</i></b>');
			$elm.children().before($('<i>b</i>'));
			strictEqual($elm.html().toLowerCase(), '<i>b</i><i>a</i>');

			$elm = $('<b><i>a</i></b>');
			$elm.children().before($('<i>b</i><i>c</i>'));
			strictEqual($elm.html().toLowerCase(), '<i>b</i><i>c</i><i>a</i>');
		});

		test(prefix + 'after() element', function() {
			var $elm;

			$elm = $('<b><i>a</i></b>');
			$elm.children().after($('<i>b</i>'));
			strictEqual($elm.html().toLowerCase(), '<i>a</i><i>b</i>');

			$elm = $('<b><i>a</i></b>');
			$elm.children().after($('<i>b</i><i>c</i>'));
			strictEqual($elm.html().toLowerCase(), '<i>a</i><i>b</i><i>c</i>');
		});

		test(prefix + 'appendTo() to element', function() {
			var $elm;

			$elm = $('<b>a</b>');
			$('<i>b</i>').appendTo($elm);
			strictEqual($elm.html().toLowerCase(), 'a<i>b</i>');

			$elm = $('<b>a</b>');
			$('<i>b</i><b>c</b>').appendTo($elm);
			strictEqual($elm.html().toLowerCase(), 'a<i>b</i><b>c</b>');

			$elm = $('<b></b>');
			$('<i>b</i>').appendTo($elm);
			strictEqual($elm.html().toLowerCase(), '<i>b</i>');
		});

		test(prefix + 'prependTo() to element', function() {
			var $elm;

			$elm = $('<b>a</b>');
			$('<i>b</i>').prependTo($elm);
			strictEqual($elm.html().toLowerCase(), '<i>b</i>a');

			$elm = $('<b>a</b>');
			$('<i>b</i><b>c</b>').prependTo($elm);
			strictEqual($elm.html().toLowerCase(), '<i>b</i><b>c</b>a');

			$elm = $('<b></b>');
			$('<i>b</i>').prependTo($elm);
			strictEqual($elm.html().toLowerCase(), '<i>b</i>');
		});

		test(prefix + 'addClass() to element', function() {
			var $elm;

			$elm = $('<b></b>').addClass('a');
			strictEqual($elm.attr('class'), 'a');

			$elm = $('<b class="a"></b>').addClass('b');
			strictEqual($elm.attr('class'), 'a b');
		});

		test(prefix + 'removeClass() from element', function() {
			var $elm;

			$elm = $('<b class="x"></b>').removeClass('a');
			strictEqual($elm.attr('class'), 'x');

			$elm = $('<b class="a b"></b>').removeClass('b');
			strictEqual($elm.attr('class'), 'a');

			$elm = $('<b class="a"></b>').removeClass('a');
			strictEqual($elm.attr('class'), '');
		});

		test(prefix + 'toggleClass() on element', function() {
			var $elm;

			$elm = $('<b class="x"></b>').toggleClass('a');
			strictEqual($elm.attr('class'), 'x a');

			$elm = $('<b class="a b"></b>').toggleClass('b');
			strictEqual($elm.attr('class'), 'a');

			$elm = $('<b class="a"></b>').toggleClass('a', true);
			strictEqual($elm.attr('class'), 'a');

			$elm = $('<b class="a b"></b>').toggleClass('a', false);
			strictEqual($elm.attr('class'), 'b');
		});

		test(prefix + 'toggleClass() on element', function() {
			strictEqual($('<b class="a"></b>').hasClass('a'), true);
			strictEqual($('<b class="a"></b>').hasClass('b'), false);
			strictEqual($('<b class="a b"></b>').hasClass('b'), true);
			strictEqual($('<b class="a b"></b>').hasClass('a'), true);
		});

		test(prefix + 'filter()', function() {
			strictEqual($('<b></b><i></i><u></u>').filter('b,i').length, 2);
			strictEqual($('<b></b><i></i><u></u>').filter(function(i, elm) {
				return elm.tagName != 'U';
			}).length, 2);
			strictEqual($('<b></b><i></i><u></u>').filter(function(i) {
				return i != 2;
			}).length, 2);
			strictEqual($([document, window, document.createTextNode('x')]).filter('*').length, 0);
			strictEqual($.filter('*', [document, window, document.createTextNode('x')]).length, 0);
		});

		test(prefix + 'each() collection', function() {
			var $html = $('<b>a</b><i>b</i>'), data;

			data = '';
			$html.each(function(index, elm) {
				data += index + elm.innerHTML + this.innerHTML;
			});
			strictEqual(data, '0aa1bb');

			data = '';
			$html.each(function(index, elm) {
				data += index + elm.innerHTML + this.innerHTML;

				if (index === 0) {
					return false;
				}
			});
			strictEqual(data, '0aa');
		});

		test(prefix + 'on()/off()/trigger()', function() {
			var lastArgs1, lastArgs2;

			$elm = $('<b />');

			// Single listener
			$elm.on('click', function(e) {
				lastArgs1 = e;
			});
			$elm.trigger('click');
			strictEqual(lastArgs1.type, 'click');

			// Single listener trigger object
			$elm.off().on('click', function(e) {
				lastArgs1 = e;
			});
			$elm.trigger({type: 'click', custom: 'x'});
			strictEqual(lastArgs1.type, 'click');
			strictEqual(lastArgs1.custom, 'x');

			// Unbind listeners
			lastArgs1 = null;
			$elm.off('click');
			$elm.trigger('click');
			strictEqual(lastArgs1, null);

			// Bind two listeners
			$elm.on('click', function(e) {
				lastArgs1 = e;
			});
			$elm.on('click', function(e) {
				lastArgs2 = e;
			});
			$elm.trigger('click');
			strictEqual(lastArgs1.type, 'click');
			strictEqual(lastArgs2.type, 'click');

			// Bind two listeners and stop propagation
			lastArgs1 = lastArgs2 = null;
			$elm.off('click');
			$elm.on('click', function(e) {
				lastArgs1 = e;
				e.stopImmediatePropagation();
			});
			$elm.on('click', function(e) {
				lastArgs2 = e;
			});
			$elm.trigger('click');
			strictEqual(lastArgs1.type, 'click');
			strictEqual(lastArgs2, null);
		});

		test(prefix + 'show()/hide() element', function() {
			equal(normalizeStyleValue($('<b></b>').appendTo('#view').hide().attr('style')), 'display: none');
			equal(normalizeStyleValue($('<b></b>').empty().appendTo('#view').show().attr('style')), undefined);
		});

		test(prefix + 'slice/eq/first/last() on collection', function() {
			var $html = $('<b>1</b><i>2</i><em>3</em>');

			strictEqual($html.slice(1).length, 2);
			strictEqual($html.slice(1)[0].tagName, 'I');
			strictEqual($html.slice(1)[1].tagName, 'EM');

			strictEqual($html.slice(1, 2).length, 1);
			strictEqual($html.slice(1, 2)[0].tagName, 'I');

			strictEqual($html.slice(-2, -1).length, 1);
			strictEqual($html.slice(-2, -1)[0].tagName, 'I');

			strictEqual($html.eq(1).length, 1);
			strictEqual($html.eq(1)[0].tagName, 'I');

			strictEqual($html.eq(-1).length, 1);
			strictEqual($html.eq(-1)[0].tagName, 'EM');

			strictEqual($html.eq(1).length, 1);
			strictEqual($html.eq(1)[0].tagName, 'I');

			strictEqual($html.first().length, 1);
			strictEqual($html.first()[0].tagName, 'B');

			strictEqual($html.last().length, 1);
			strictEqual($html.last()[0].tagName, 'EM');
		});

		test(prefix + 'replaceWith() on single element with single element', function() {
			var $result;

			$('<b>1</b>').appendTo('#view');
			$result = $('#view b').replaceWith('<i>2</i>');
			strictEqual($('#view').html().toLowerCase(), '<i>2</i>');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'B');
		});

		test(prefix + 'replaceWith() on single element with multiple elements', function() {
			var $result;

			$('<b>1</b>').appendTo('#view');
			$result = $('#view b').replaceWith('<i>2</i><i>3</i>');
			strictEqual($('#view').html().toLowerCase(), '<i>2</i><i>3</i>');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'B');
		});
/*
		test(prefix + 'replaceWith() on multiple elements with multiple elements', function() {
			var $result;

			$('<b>1</b><i>2</i>').appendTo('#view');
			$result = $('#view b, #view i').replaceWith('<i>3</i><i>4</i>');
			strictEqual($('#view').html().toLowerCase(), '<i>3</i><i>4</i>');
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'B');
			strictEqual($result[1].tagName, 'I');
		});
*/
		test(prefix + 'wrap() single element', function() {
			$('<b>1</b>').appendTo('#view').wrap('<i>');
			strictEqual($('#view').html().toLowerCase(), '<i><b>1</b></i>');
		});

		test(prefix + 'wrap() multiple element', function() {
			$('<b>1</b><b>2</b>').appendTo('#view').wrap('<i>');
			strictEqual($('#view').html().toLowerCase(), '<i><b>1</b></i><i><b>2</b></i>');
		});

		test(prefix + 'wrapAll() multiple element', function() {
			$('<b>1</b><b>2</b>').appendTo('#view').wrapAll('<i>');
			strictEqual($('#view').html().toLowerCase(), '<i><b>1</b><b>2</b></i>');
		});

		test(prefix + 'wrapInner() multiple element', function() {
			$('<b>1<i>a</i></b><b>2<i>b</i></b>').appendTo('#view').wrapInner('<i>');
			strictEqual($('#view').html().toLowerCase(), '<b><i>1<i>a</i></i></b><b><i>2<i>b</i></i></b>');
		});

		test(prefix + 'unwrap() single element with no siblings', function() {
			$('#view').html('<b><i>1</i></b>');
			$('#view i').unwrap();
			strictEqual($('#view').html().toLowerCase(), '<i>1</i>');
		});

		test(prefix + 'unwrap() single element with siblings', function() {
			$('#view').html('<b><i>1</i><i>2</i></b>');
			$('#view i').unwrap();
			strictEqual($('#view').html().toLowerCase(), '<i>1</i><i>2</i>');
		});

		test(prefix + 'clone() single element', function() {
			$('<b>1</b>').appendTo('#view').clone().appendTo('#view');
			strictEqual($('#view').html().toLowerCase(), '<b>1</b><b>1</b>');
		});

		test(prefix + 'find()', function() {
			var $result;

			$('#view').append('<em><i>1</i></em><strong><b>2</b></strong>');

			$result = $('#view').find('*');
			strictEqual($result.length, 4);

			$result = $('#view em').find('*');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'I');

			$result = $('#view em, #view strong').find('*');
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'I');
			strictEqual($result[1].tagName, 'B');
		});

		test(prefix + 'parent()', function() {
			var $result;

			$('#view').append('<em><i>1</i></em><strong><b>2</b></strong>');

			$result = $('#view i, #view b').parent();
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'EM');
			strictEqual($result[1].tagName, 'STRONG');

			$result = $('#view i, #view b').parent('em');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'EM');

			$result = $('#view i, #view b').parent('div');
			strictEqual($result.length, 0);
		});

		test(prefix + 'parents()', function() {
			var $result;

			$('<div><em><i>1</i></em><strong><b>2</b></strong></div>').appendTo('#view');

			$result = splitAtView($('#view i, #view b').parents());
			strictEqual($result.length, 3);
			strictEqual($result[0].tagName, 'STRONG');
			strictEqual($result[1].tagName, 'EM');
			strictEqual($result[2].tagName, 'DIV');

			$result = splitAtView($('#view i, #view b').parents('em'));
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'EM');

			$result = splitAtView($('#view i, #view b').parents('p'));
			strictEqual($result.length, 0);
		});

		test(prefix + 'parentsUntil(selector)', function() {
			var $result;

			$('<div><em><i>1</i></em><strong><b>2</b></strong></div>').appendTo('#view');

			$result = $('#view i, #view b').parentsUntil('#view');
			strictEqual($result.length, 3);
			strictEqual($result[0].tagName, 'STRONG');
			strictEqual($result[1].tagName, 'EM');
			strictEqual($result[2].tagName, 'DIV');

			$result = $('#view i, #view b').parentsUntil('#view', 'div');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'DIV');
		});

		test(prefix + 'parentsUntil(element)', function() {
			var $result;

			$('<div><em><i>1</i></em><strong><b>2</b></strong></div>').appendTo('#view');

			$result = $('#view i, #view b').parentsUntil(document.getElementById('view'));
			strictEqual($result.length, 3);
			strictEqual($result[0].tagName, 'STRONG');
			strictEqual($result[1].tagName, 'EM');
			strictEqual($result[2].tagName, 'DIV');

			$result = $('#view i, #view b').parentsUntil(document.getElementById('view'), 'div');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'DIV');
		});

		test(prefix + 'parentsUntil(query)', function() {
			var $result;

			$('<div><em><i>1</i></em><strong><b>2</b></strong></div>').appendTo('#view');

			$result = $('#view i, #view b').parentsUntil($('#view'));
			strictEqual($result.length, 3);
			strictEqual($result[0].tagName, 'STRONG');
			strictEqual($result[1].tagName, 'EM');
			strictEqual($result[2].tagName, 'DIV');

			$result = $('#view i, #view b').parentsUntil($('#view'), 'div');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'DIV');
		});

		test(prefix + 'next()', function() {
			var $result, html;

			html = $('<b>1</b>2<i>3</i>');

			$result = html.next();
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'I');
		});

		test(prefix + 'prev()', function() {
			var $result, html;

			html = $('<b>1</b>2<i>3</i>');

			$result = $(html).prev();
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'B');
		});

		test(prefix + 'nextUntil(selector)', function() {
			var $result, html;

			html = $('<b>1</b><i>2</i><em>3</em><span>3</span>');

			$result = html.first().nextUntil('span');
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'I');
			strictEqual($result[1].tagName, 'EM');

			$result = html.first().nextUntil('span', 'i');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'I');
		});

		test(prefix + 'nextUntil(element)', function() {
			var $result, html;

			html = $('<b>1</b><i>2</i><em>3</em><span>3</span>');

			$result = html.first().nextUntil(html.last()[0]);
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'I');
			strictEqual($result[1].tagName, 'EM');

			$result = html.first().nextUntil(html.last()[0], 'i');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'I');
		});

		test(prefix + 'nextUntil(query)', function() {
			var $result, html;

			html = $('<b>1</b><i>2</i><em>3</em><span>3</span>');

			$result = html.first().nextUntil(html.last());
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'I');
			strictEqual($result[1].tagName, 'EM');

			$result = html.first().nextUntil(html.last(), 'i');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'I');
		});

		test(prefix + 'prevUntil(selector)', function() {
			var $result, html;

			html = $('<b>1</b><i>2</i><em>3</em><span>3</span>');

			$result = html.last().prevUntil('b');
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'EM');
			strictEqual($result[1].tagName, 'I');

			$result = html.last().prevUntil('b', 'i');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'I');
		});

		test(prefix + 'prevUntil(element)', function() {
			var $result, html;

			html = $('<b>1</b><i>2</i><em>3</em><span>3</span>');

			$result = html.last().prevUntil(html.first()[0]);
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'EM');
			strictEqual($result[1].tagName, 'I');

			$result = html.last().prevUntil(html.first()[0], 'i');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'I');
		});

		test(prefix + 'prevUntil(query)', function() {
			var $result, html;

			html = $('<b>1</b><i>2</i><em>3</em><span>3</span>');

			$result = html.last().prevUntil(html.first());
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'EM');
			strictEqual($result[1].tagName, 'I');

			$result = html.last().prevUntil(html.first(), 'i');
			strictEqual($result.length, 1);
			strictEqual($result[0].tagName, 'I');
		});

		test(prefix + 'children()', function() {
			var $result, html;

			html = $('<b>1<i>2</i><b>3</b></b>');

			$result = html.children();
			strictEqual($result.length, 2);
			strictEqual($result[0].tagName, 'I');
			strictEqual($result[1].tagName, 'B');
		});

		test(prefix + 'contents()', function() {
			var $result, html;

			html = $('<b>1<i>2</i><b>3</b></b>');

			$result = html.contents();
			strictEqual($result.length, 3);
			strictEqual($result[0].nodeName, '#text');
			strictEqual($result[1].tagName, 'I');
			strictEqual($result[2].tagName, 'B');
		});

		test(prefix + 'closest(selector/element/query)', function() {
			var innerMost, html;

			html = $('<b><i><em><b>x</b></em></i></b>');
			innerMost = $(html[0].firstChild.firstChild.firstChild);

			strictEqual(innerMost.closest(null).length, 0);
			strictEqual(innerMost.closest('b').html(), 'x');
			strictEqual(innerMost.closest(innerMost[0]).html(), 'x');
			strictEqual(innerMost.closest('b i').html().toLowerCase(), '<em><b>x</b></em>');
			strictEqual(innerMost.closest($(html[0].firstChild.firstChild)).html().toLowerCase(), '<b>x</b>');
			strictEqual(innerMost.closest($(html[0].firstChild.firstChild)[0]).html().toLowerCase(), '<b>x</b>');
		});

		test(prefix + 'offset()', function() {
			var testElm = $('<b></b>').offset({top: 10, left: 20});
			strictEqual(testElm[0].style.top, '10px');
			strictEqual(testElm[0].style.left, '20px');

			var viewOffset = $('#view').offset();
			var testElmOffset = $('<b></b>').css({position: 'absolute', top: 10, left: 20}).prependTo('#view').offset();

			testElmOffset.left -= viewOffset.left;
			testElmOffset.top -= viewOffset.top;

			deepEqual(testElmOffset, {top: 10, left: 20});
		});
	}

	// Run tests against jQuery/DomQuery so we know that we are compatible
	addTests('DomQuery: ', tinymce.dom.DomQuery);

	/*global jQuery*/
	addTests('jQuery: ', jQuery);
})();
