module("tinymce.html.Node");

test('construction', function() {
	var node;

	expect(15);

	node = new tinymce.html.Node('#text', 3);
	equal(node.name, '#text');
	equal(node.type, 3);

	node = new tinymce.html.Node('#comment', 8);
	equal(node.name, '#comment');
	equal(node.type, 8);

	node = new tinymce.html.Node('b', 1);
	equal(node.name, 'b');
	equal(node.type, 1);
	deepEqual(node.attributes, []);

	node = new tinymce.html.Node('#pi', 7);
	equal(node.name, '#pi');
	equal(node.type, 7);

	node = new tinymce.html.Node('#doctype', 10);
	equal(node.name, '#doctype');
	equal(node.type, 10);

	node = new tinymce.html.Node('#cdata', 4);
	equal(node.name, '#cdata');
	equal(node.type, 4);

	node = new tinymce.html.Node('#frag', 11);
	equal(node.name, '#frag');
	equal(node.type, 11);
});

test('append inside empty node', function() {
	var root, node;

	expect(10);

	root = new tinymce.html.Node('#frag', 11);
	node = root.append(new tinymce.html.Node('b', 1));
	ok(root.firstChild.parent === root);
	equal(root.firstChild.next, undefined);
	equal(root.firstChild.prev, undefined);
	equal(root.firstChild.firstChild, undefined);
	equal(root.firstChild.lastChild, undefined);
	ok(node.parent === root);
	equal(node.next, undefined);
	equal(node.prev, undefined);
	equal(node.firstChild, undefined);
	equal(node.lastChild, undefined);
});

test('append node after node', function() {
	var root, node, node2;

	expect(17);

	root = new tinymce.html.Node('#frag', 11);
	node2 = root.append(new tinymce.html.Node('a', 1));
	node = root.append(new tinymce.html.Node('b', 1));
	ok(root.firstChild.parent === root, 'root.firstChild.parent === root');
	ok(root.firstChild === node2, 'root.firstChild');
	ok(root.lastChild === node, 'root.firstChild');
	ok(root.firstChild.next === node, 'root.firstChild.next');
	equal(root.firstChild.prev, undefined, 'root.firstChild.prev');
	equal(root.firstChild.firstChild, undefined, 'root.firstChild.firstChild');
	equal(root.firstChild.lastChild, undefined, 'root.firstChild.lastChild');
	ok(node2.parent === root, 'node2.parent === root');
	ok(node2.next === node, 'node2.next');
	equal(node2.prev, undefined, 'node2.prev');
	equal(node2.firstChild, undefined, 'node2.firstChild');
	equal(node2.lastChild, undefined, 'node2.lastChild');
	ok(node.parent === root, 'node.parent === root');
	equal(node.next, undefined, 'node.next');
	ok(node.prev === node2, 'node.prev');
	equal(node.firstChild, undefined, 'node.firstChild');
	equal(node.lastChild, undefined, 'node.lastChild');
});

test('append existing node before other existing node', function() {
	var root, node, node2;

	expect(8);

	root = new tinymce.html.Node('#frag', 11);
	node = root.append(new tinymce.html.Node('a', 1));
	node2 = root.append(new tinymce.html.Node('b', 1));
	root.append(node);
	ok(root.firstChild === node2, 'root.firstChild');
	ok(root.lastChild === node, 'root.lastChild');
	equal(node.next, undefined, 'node.next');
	ok(node.prev === node2, 'node.prev');
	ok(node.parent === root, 'node.parent');
	ok(node2.parent === root, 'node2.parent');
	equal(node2.prev, undefined, 'node2.prev');
	ok(node2.next === node, 'node2.next');
});

test('remove unattached node', function() {
	expect(1);

	ok(!new tinymce.html.Node('#text', 3).remove().parent);
});

test('remove single child', function() {
	var root, node;

	expect(6);

	root = new tinymce.html.Node('#frag', 11);
	node = root.append(new tinymce.html.Node('p', 1));
	node = root.firstChild.remove();
	equal(root.firstChild, undefined);
	equal(root.lastChild, undefined);
	equal(node.parent, undefined);
	equal(node.next, undefined);
	equal(node.prev, undefined);
	equal(node.name, 'p');
});

test('remove middle node', function() {
	var root, node, node2, node3;

	expect(9);

	root = new tinymce.html.Node('#frag', 11);
	node = root.append(new tinymce.html.Node('a', 1));
	node2 = root.append(new tinymce.html.Node('b', 1));
	node3 = root.append(new tinymce.html.Node('c', 1));
	node2.remove();
	equal(node2.parent, undefined);
	equal(node2.next, undefined);
	equal(node2.prev, undefined);
	ok(root.firstChild === node, 'root.firstChild');
	ok(root.lastChild === node3, 'root.lastChild');
	ok(node.next === node3, 'node.next');
	equal(node.prev, undefined, 'node.prev');
	equal(node3.prev, node, 'node3.prev');
	equal(node3.next, undefined, 'node3.next');
});

test('insert after last', function() {
	var fragment, root, node, node2;

	expect(5);

	fragment = new tinymce.html.Node('#frag', 11);
	root = fragment.append(new tinymce.html.Node('body', 1));
	node = root.append(new tinymce.html.Node('a', 1));
	node2 = root.insert(new tinymce.html.Node('x', 1), node);
	ok(root.firstChild === node, 'root.firstChild');
	ok(root.lastChild === node2, 'root.lastChild');
	ok(node.next === node2, 'node.next');
	ok(node2.prev === node, 'node2.prev');
	ok(node2.parent === root, 'node3.next');
});

test('insert before first', function() {
	var fragment, root, node, node2;

	expect(8);

	fragment = new tinymce.html.Node('#frag', 11);
	root = fragment.append(new tinymce.html.Node('body', 1));
	node = root.append(new tinymce.html.Node('a', 1));
	node2 = root.insert(new tinymce.html.Node('x', 1), node, true);
	ok(root.firstChild === node2, 'root.firstChild');
	ok(root.lastChild === node, 'root.lastChild');
	ok(node2.parent === root, 'node2.lastChild');
	ok(node2.next === node, 'node2.next');
	ok(node2.prev === undefined, 'node2.prev');
	ok(node.parent === root, 'node.lastChild');
	ok(node.next === undefined, 'node.next');
	ok(node.prev === node2, 'node.prev');
});

test('insert before second', function() {
	var fragment, root, node, node2, node3;

	expect(5);

	fragment = new tinymce.html.Node('#frag', 11);
	root = fragment.append(new tinymce.html.Node('body', 1));
	node = root.append(new tinymce.html.Node('a', 1));
	node2 = root.append(new tinymce.html.Node('b', 1));
	node3 = root.insert(new tinymce.html.Node('x', 1), node2, true);
	ok(root.firstChild === node, 'root.firstChild');
	ok(root.lastChild === node2, 'root.lastChild');
	ok(node3.parent === root, 'node3.parent');
	ok(node3.next === node2, 'node3.next');
	ok(node3.prev === node, 'node3.prev');
});

test('insert after and between two nodes', function() {
	var root, node, node2, node3, fragment;

	expect(7);

	fragment = new tinymce.html.Node('#frag', 11);
	root = fragment.append(new tinymce.html.Node('body', 1));
	node = root.append(new tinymce.html.Node('a', 1));
	node2 = root.append(new tinymce.html.Node('b', 1));
	node3 = root.insert(new tinymce.html.Node('x', 1), node);
	ok(root.firstChild === node, 'root.firstChild');
	ok(root.lastChild === node2, 'root.lastChild');
	ok(node.next === node3, 'node.next');
	ok(node2.prev === node3, 'node2.prev');
	ok(node3.parent === root, 'node3.next');
	ok(node3.next === node2, 'node3.next');
	ok(node3.prev === node, 'node3.prev');
});

test('replace single child', function() {
	var root, node1, node2;

	expect(5);

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('b', 1));
	node2 = root.append(new tinymce.html.Node('em', 1));
	node1.replace(node2);
	ok(root.firstChild === node2, 'root.firstChild');
	ok(root.lastChild === node2, 'root.lastChild');
	ok(node2.parent === root, 'node2.parent');
	ok(!node2.next, 'node2.next');
	ok(!node2.prev, 'node2.prev');
});

test('replace first child', function() {
	var root, node1, node2, node3;

	expect(5);

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('b', 1));
	node2 = root.append(new tinymce.html.Node('em', 1));
	node3 = root.append(new tinymce.html.Node('b', 1));
	node1.replace(node2);
	ok(root.firstChild === node2, 'root.firstChild');
	ok(root.lastChild === node3, 'root.lastChild');
	ok(node2.parent === root, 'node2.parent');
	ok(node2.next === node3, 'node2.next');
	ok(!node2.prev, 'node2.prev');
});

test('replace last child', function() {
	var root, node1, node2, node3;

	expect(5);

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('b', 1));
	node3 = root.append(new tinymce.html.Node('b', 1));
	node2 = root.append(new tinymce.html.Node('em', 1));
	node3.replace(node2);
	ok(root.firstChild === node1, 'root.firstChild');
	ok(root.lastChild === node2, 'root.lastChild');
	ok(node2.parent === root, 'node2.parent');
	ok(!node2.next, 'node2.next');
	ok(node2.prev === node1, 'node2.prev');
});

test('replace middle child', function() {
	var root, node1, node2, node3, node4;

	expect(5);

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('b', 1));
	node2 = root.append(new tinymce.html.Node('b', 1));
	node3 = root.append(new tinymce.html.Node('b', 1));
	node4 = root.append(new tinymce.html.Node('em', 1));
	node2.replace(node4);
	ok(root.firstChild === node1, 'root.firstChild');
	ok(root.lastChild === node3, 'root.lastChild');
	ok(node4.parent === root, 'node4.parent');
	ok(node4.next === node3, 'node4.next');
	ok(node4.prev === node1, 'node4.prev');
});

test('attr', 22, function() {
	var node;

	node = new tinymce.html.Node('b', 1);
	deepEqual(node.attributes, []);
	node.attr('attr1', 'value1');
	equal(node.attr('attr1'), 'value1');
	equal(node.attr('attr2'), undefined);
	deepEqual(node.attributes, [{name: 'attr1', value: 'value1'}]);
	deepEqual(node.attributes.map, {'attr1': 'value1'});

	node = new tinymce.html.Node('b', 1);
	deepEqual(node.attributes, []);
	node.attr('attr1', 'value1');
	node.attr('attr1', 'valueX');
	equal(node.attr('attr1'), 'valueX');
	deepEqual(node.attributes, [{name: 'attr1', value: 'valueX'}]);
	deepEqual(node.attributes.map, {'attr1': 'valueX'});

	node = new tinymce.html.Node('b', 1);
	deepEqual(node.attributes, []);
	node.attr('attr1', 'value1');
	node.attr('attr2', 'value2');
	equal(node.attr('attr1'), 'value1');
	equal(node.attr('attr2'), 'value2');
	deepEqual(node.attributes, [{name: 'attr1', value: 'value1'}, {name: 'attr2', value: 'value2'}]);
	deepEqual(node.attributes.map, {'attr1': 'value1', 'attr2': 'value2'});

	node = new tinymce.html.Node('b', 1);
	deepEqual(node.attributes, []);
	node.attr('attr1', 'value1');
	node.attr('attr1', null);
	equal(node.attr('attr1'), undefined);
	deepEqual(node.attributes, []);
	deepEqual(node.attributes.map, {});

	node = new tinymce.html.Node('b', 1);
	node.attr({a:'1', b:'2'});
	deepEqual(node.attributes, [{name: 'a', value: '1'}, {name: 'b', value: '2'}]);
	deepEqual(node.attributes.map, {a:'1', b:'2'});

	node = new tinymce.html.Node('b', 1);
	node.attr(null);
	deepEqual(node.attributes, []);
	deepEqual(node.attributes.map, {});
});

test('clone', function() {
	var root, node, clone;

	expect(16);

	node = new tinymce.html.Node('#text', 3);
	node.value = 'value';
	clone = node.clone();
	equal(clone.name, '#text');
	equal(clone.type, 3);
	equal(clone.value, 'value');
	equal(clone.parent, undefined);
	equal(clone.next, undefined);
	equal(clone.prev, undefined);

	root = new tinymce.html.Node('#frag', 11);
	node = new tinymce.html.Node('#text', 3);
	node.value = 'value';
	root.append(node);
	equal(clone.name, '#text');
	equal(clone.type, 3);
	equal(clone.value, 'value');
	equal(clone.parent, undefined);
	equal(clone.next, undefined);
	equal(clone.prev, undefined);

	node = new tinymce.html.Node('b', 1);
	node.attr('id', 'id');
	node.attr('class', 'class');
	node.attr('title', 'title');
	clone = node.clone();
	equal(clone.name, 'b');
	equal(clone.type, 1);
	deepEqual(clone.attributes, [{name: 'class', value: 'class'}, {name: 'title', value: 'title'}]);
	deepEqual(clone.attributes.map, {'class': 'class', 'title': 'title'});
});

test('unwrap', function() {
	var root, node1, node2, node3;

	expect(7);

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('b', 1));
	node2 = node1.append(new tinymce.html.Node('em', 1));
	node1.unwrap();
	ok(root.firstChild === node2, 'root.firstChild');
	ok(root.lastChild === node2, 'root.lastChild');
	ok(node2.parent === root, 'node2.parent');

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('b', 1));
	node2 = node1.append(new tinymce.html.Node('em', 1));
	node3 = node1.append(new tinymce.html.Node('span', 1));
	node1.unwrap();
	ok(root.firstChild === node2, 'root.firstChild');
	ok(root.lastChild === node3, 'root.lastChild');
	ok(node2.parent === root, 'node2.parent');
	ok(node3.parent === root, 'node3.parent');
});

test('empty', function() {
	var root, node1, node2;

	expect(4);

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('b', 1));
	node2 = node1.append(new tinymce.html.Node('em', 1));
	node1.empty();
	ok(root.firstChild === node1, 'root.firstChild');
	ok(root.lastChild === node1, 'root.firstChild');
	ok(!node1.firstChild, 'node1.firstChild');
	ok(!node1.lastChild, 'node1.firstChild');
});

test('isEmpty', function() {
	var root, node1, node2;

	expect(9);

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('p', 1));
	node2 = node1.append(new tinymce.html.Node('b', 1));
	ok(root.isEmpty({img: 1}), 'Is empty 1');
	ok(node1.isEmpty({img: 1}), 'Is empty 2');

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('p', 1));
	node2 = node1.append(new tinymce.html.Node('img', 1));
	ok(!root.isEmpty({img: 1}), 'Is not empty 1');
	ok(!node1.isEmpty({img: 1}), 'Is not empty 2');

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('p', 1));
	node2 = node1.append(new tinymce.html.Node('#text', 3));
	node2.value = 'X';
	ok(!root.isEmpty({img: 1}), 'Is not empty 3');
	ok(!node1.isEmpty({img: 1}), 'Is not empty 4');

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('p', 1));
	node2 = node1.append(new tinymce.html.Node('#text', 3));
	node2.value = '';
	ok(root.isEmpty({img: 1}), 'Is empty 4');
	ok(node1.isEmpty({img: 1}), 'Is empty 5');

	root = new tinymce.html.Node('#frag', 11);
	node1 = root.append(new tinymce.html.Node('a', 1)).attr('name', 'x');
	ok(!root.isEmpty({img: 1}), 'Contains anchor with name attribute.');
});
