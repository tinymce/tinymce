asynctest(
  'browser.tinymce.core.html.NodeTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.html.Node'
  ],
  function (LegacyUnit, Pipeline, Node) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    var ok = function (value, label) {
      return LegacyUnit.equal(value, true, label);
    };

    suite.test('construction', function () {
      var node;

      node = new Node('#text', 3);
      LegacyUnit.equal(node.name, '#text');
      LegacyUnit.equal(node.type, 3);

      node = new Node('#comment', 8);
      LegacyUnit.equal(node.name, '#comment');
      LegacyUnit.equal(node.type, 8);

      node = new Node('b', 1);
      LegacyUnit.equal(node.name, 'b');
      LegacyUnit.equal(node.type, 1);
      LegacyUnit.deepEqual(node.attributes, []);

      node = new Node('#pi', 7);
      LegacyUnit.equal(node.name, '#pi');
      LegacyUnit.equal(node.type, 7);

      node = new Node('#doctype', 10);
      LegacyUnit.equal(node.name, '#doctype');
      LegacyUnit.equal(node.type, 10);

      node = new Node('#cdata', 4);
      LegacyUnit.equal(node.name, '#cdata');
      LegacyUnit.equal(node.type, 4);

      node = new Node('#frag', 11);
      LegacyUnit.equal(node.name, '#frag');
      LegacyUnit.equal(node.type, 11);
    });

    suite.test('append inside empty node', function () {
      var root, node;

      root = new Node('#frag', 11);
      node = root.append(new Node('b', 1));
      LegacyUnit.equal(root.firstChild.parent === root, true);
      LegacyUnit.equal(root.firstChild.next, undefined);
      LegacyUnit.equal(root.firstChild.prev, undefined);
      LegacyUnit.equal(root.firstChild.firstChild, undefined);
      LegacyUnit.equal(root.firstChild.lastChild, undefined);
      LegacyUnit.equal(node.parent === root, true);
      LegacyUnit.equal(node.next, undefined);
      LegacyUnit.equal(node.prev, undefined);
      LegacyUnit.equal(node.firstChild, undefined);
      LegacyUnit.equal(node.lastChild, undefined);
    });

    suite.test('append node after node', function () {
      var root, node, node2;

      root = new Node('#frag', 11);
      node2 = root.append(new Node('a', 1));
      node = root.append(new Node('b', 1));
      ok(root.firstChild.parent === root, 'root.firstChild.parent === root');
      ok(root.firstChild === node2, 'root.firstChild');
      ok(root.lastChild === node, 'root.firstChild');
      ok(root.firstChild.next === node, 'root.firstChild.next');
      LegacyUnit.equal(root.firstChild.prev, undefined, 'root.firstChild.prev');
      LegacyUnit.equal(root.firstChild.firstChild, undefined, 'root.firstChild.firstChild');
      LegacyUnit.equal(root.firstChild.lastChild, undefined, 'root.firstChild.lastChild');
      ok(node2.parent === root, 'node2.parent === root');
      ok(node2.next === node, 'node2.next');
      LegacyUnit.equal(node2.prev, undefined, 'node2.prev');
      LegacyUnit.equal(node2.firstChild, undefined, 'node2.firstChild');
      LegacyUnit.equal(node2.lastChild, undefined, 'node2.lastChild');
      ok(node.parent === root, 'node.parent === root');
      LegacyUnit.equal(node.next, undefined, 'node.next');
      ok(node.prev === node2, 'node.prev');
      LegacyUnit.equal(node.firstChild, undefined, 'node.firstChild');
      LegacyUnit.equal(node.lastChild, undefined, 'node.lastChild');
    });

    suite.test('append existing node before other existing node', function () {
      var root, node, node2;

      root = new Node('#frag', 11);
      node = root.append(new Node('a', 1));
      node2 = root.append(new Node('b', 1));
      root.append(node);
      ok(root.firstChild === node2, 'root.firstChild');
      ok(root.lastChild === node, 'root.lastChild');
      LegacyUnit.equal(node.next, null, 'node.next');
      ok(node.prev === node2, 'node.prev');
      ok(node.parent === root, 'node.parent');
      ok(node2.parent === root, 'node2.parent');
      LegacyUnit.equal(node2.prev, undefined, 'node2.prev');
      ok(node2.next === node, 'node2.next');
    });

    suite.test('remove unattached node', function () {
      ok(!new Node('#text', 3).remove().parent);
    });

    suite.test('remove single child', function () {
      var root, node;

      root = new Node('#frag', 11);
      node = root.append(new Node('p', 1));
      node = root.firstChild.remove();
      LegacyUnit.equal(root.firstChild, undefined);
      LegacyUnit.equal(root.lastChild, undefined);
      LegacyUnit.equal(node.parent, null);
      LegacyUnit.equal(node.next, null);
      LegacyUnit.equal(node.prev, null);
      LegacyUnit.equal(node.name, 'p');
    });

    suite.test('remove middle node', function () {
      var root, node, node2, node3;

      root = new Node('#frag', 11);
      node = root.append(new Node('a', 1));
      node2 = root.append(new Node('b', 1));
      node3 = root.append(new Node('c', 1));
      node2.remove();
      LegacyUnit.equal(node2.parent, null);
      LegacyUnit.equal(node2.next, null);
      LegacyUnit.equal(node2.prev, null);
      ok(root.firstChild === node, 'root.firstChild');
      ok(root.lastChild === node3, 'root.lastChild');
      ok(node.next === node3, 'node.next');
      LegacyUnit.equal(node.prev, undefined, 'node.prev');
      LegacyUnit.equal(node3.prev === node, true, 'node3.prev');
      LegacyUnit.equal(node3.next, undefined, 'node3.next');
    });

    suite.test('insert after last', function () {
      var fragment, root, node, node2;

      fragment = new Node('#frag', 11);
      root = fragment.append(new Node('body', 1));
      node = root.append(new Node('a', 1));
      node2 = root.insert(new Node('x', 1), node);
      ok(root.firstChild === node, 'root.firstChild');
      ok(root.lastChild === node2, 'root.lastChild');
      ok(node.next === node2, 'node.next');
      ok(node2.prev === node, 'node2.prev');
      ok(node2.parent === root, 'node3.next');
    });

    suite.test('insert before first', function () {
      var fragment, root, node, node2;

      fragment = new Node('#frag', 11);
      root = fragment.append(new Node('body', 1));
      node = root.append(new Node('a', 1));
      node2 = root.insert(new Node('x', 1), node, true);
      ok(root.firstChild === node2, 'root.firstChild');
      ok(root.lastChild === node, 'root.lastChild');
      ok(node2.parent === root, 'node2.lastChild');
      ok(node2.next === node, 'node2.next');
      ok(node2.prev === undefined, 'node2.prev');
      ok(node.parent === root, 'node.lastChild');
      ok(node.next === undefined, 'node.next');
      ok(node.prev === node2, 'node.prev');
    });

    suite.test('insert before second', function () {
      var fragment, root, node, node2, node3;

      fragment = new Node('#frag', 11);
      root = fragment.append(new Node('body', 1));
      node = root.append(new Node('a', 1));
      node2 = root.append(new Node('b', 1));
      node3 = root.insert(new Node('x', 1), node2, true);
      ok(root.firstChild === node, 'root.firstChild');
      ok(root.lastChild === node2, 'root.lastChild');
      ok(node3.parent === root, 'node3.parent');
      ok(node3.next === node2, 'node3.next');
      ok(node3.prev === node, 'node3.prev');
    });

    suite.test('insert after and between two nodes', function () {
      var root, node, node2, node3, fragment;

      fragment = new Node('#frag', 11);
      root = fragment.append(new Node('body', 1));
      node = root.append(new Node('a', 1));
      node2 = root.append(new Node('b', 1));
      node3 = root.insert(new Node('x', 1), node);
      ok(root.firstChild === node, 'root.firstChild');
      ok(root.lastChild === node2, 'root.lastChild');
      ok(node.next === node3, 'node.next');
      ok(node2.prev === node3, 'node2.prev');
      ok(node3.parent === root, 'node3.next');
      ok(node3.next === node2, 'node3.next');
      ok(node3.prev === node, 'node3.prev');
    });

    suite.test('replace single child', function () {
      var root, node1, node2;

      root = new Node('#frag', 11);
      node1 = root.append(new Node('b', 1));
      node2 = root.append(new Node('em', 1));
      node1.replace(node2);
      ok(root.firstChild === node2, 'root.firstChild');
      ok(root.lastChild === node2, 'root.lastChild');
      ok(node2.parent === root, 'node2.parent');
      ok(!node2.next, 'node2.next');
      ok(!node2.prev, 'node2.prev');
    });

    suite.test('replace first child', function () {
      var root, node1, node2, node3;

      root = new Node('#frag', 11);
      node1 = root.append(new Node('b', 1));
      node2 = root.append(new Node('em', 1));
      node3 = root.append(new Node('b', 1));
      node1.replace(node2);
      ok(root.firstChild === node2, 'root.firstChild');
      ok(root.lastChild === node3, 'root.lastChild');
      ok(node2.parent === root, 'node2.parent');
      ok(node2.next === node3, 'node2.next');
      ok(!node2.prev, 'node2.prev');
    });

    suite.test('replace last child', function () {
      var root, node1, node2, node3;

      root = new Node('#frag', 11);
      node1 = root.append(new Node('b', 1));
      node3 = root.append(new Node('b', 1));
      node2 = root.append(new Node('em', 1));
      node3.replace(node2);
      ok(root.firstChild === node1, 'root.firstChild');
      ok(root.lastChild === node2, 'root.lastChild');
      ok(node2.parent === root, 'node2.parent');
      ok(!node2.next, 'node2.next');
      ok(node2.prev === node1, 'node2.prev');
    });

    suite.test('replace middle child', function () {
      var root, node1, node2, node3, node4;

      root = new Node('#frag', 11);
      node1 = root.append(new Node('b', 1));
      node2 = root.append(new Node('b', 1));
      node3 = root.append(new Node('b', 1));
      node4 = root.append(new Node('em', 1));
      node2.replace(node4);
      ok(root.firstChild === node1, 'root.firstChild');
      ok(root.lastChild === node3, 'root.lastChild');
      ok(node4.parent === root, 'node4.parent');
      ok(node4.next === node3, 'node4.next');
      ok(node4.prev === node1, 'node4.prev');
    });

    suite.test('attr', function () {
      var node;

      node = new Node('b', 1);
      LegacyUnit.deepEqual(node.attributes, []);
      node.attr('attr1', 'value1');
      LegacyUnit.equal(node.attr('attr1'), 'value1');
      LegacyUnit.equal(node.attr('attr2'), undefined);
      LegacyUnit.deepEqual(node.attributes, [{ name: 'attr1', value: 'value1' }]);
      LegacyUnit.deepEqual(node.attributes.map, { 'attr1': 'value1' });

      node = new Node('b', 1);
      LegacyUnit.deepEqual(node.attributes, []);
      node.attr('attr1', 'value1');
      node.attr('attr1', 'valueX');
      LegacyUnit.equal(node.attr('attr1'), 'valueX');
      LegacyUnit.deepEqual(node.attributes, [{ name: 'attr1', value: 'valueX' }]);
      LegacyUnit.deepEqual(node.attributes.map, { 'attr1': 'valueX' });

      node = new Node('b', 1);
      LegacyUnit.deepEqual(node.attributes, []);
      node.attr('attr1', 'value1');
      node.attr('attr2', 'value2');
      LegacyUnit.equal(node.attr('attr1'), 'value1');
      LegacyUnit.equal(node.attr('attr2'), 'value2');
      LegacyUnit.deepEqual(node.attributes, [{ name: 'attr1', value: 'value1' }, { name: 'attr2', value: 'value2' }]);
      LegacyUnit.deepEqual(node.attributes.map, { 'attr1': 'value1', 'attr2': 'value2' });

      node = new Node('b', 1);
      LegacyUnit.deepEqual(node.attributes, []);
      node.attr('attr1', 'value1');
      node.attr('attr1', null);
      LegacyUnit.equal(node.attr('attr1'), undefined);
      LegacyUnit.deepEqual(node.attributes, []);
      LegacyUnit.deepEqual(node.attributes.map, {});

      node = new Node('b', 1);
      node.attr({ a: '1', b: '2' });
      LegacyUnit.deepEqual(node.attributes, [{ name: 'a', value: '1' }, { name: 'b', value: '2' }]);
      LegacyUnit.deepEqual(node.attributes.map, { a: '1', b: '2' });

      node = new Node('b', 1);
      node.attr(null);
      LegacyUnit.deepEqual(node.attributes, []);
      LegacyUnit.deepEqual(node.attributes.map, {});
    });

    suite.test('clone', function () {
      var root, node, clone;

      node = new Node('#text', 3);
      node.value = 'value';
      clone = node.clone();
      LegacyUnit.equal(clone.name, '#text');
      LegacyUnit.equal(clone.type, 3);
      LegacyUnit.equal(clone.value, 'value');
      LegacyUnit.equal(clone.parent, undefined);
      LegacyUnit.equal(clone.next, undefined);
      LegacyUnit.equal(clone.prev, undefined);

      root = new Node('#frag', 11);
      node = new Node('#text', 3);
      node.value = 'value';
      root.append(node);
      LegacyUnit.equal(clone.name, '#text');
      LegacyUnit.equal(clone.type, 3);
      LegacyUnit.equal(clone.value, 'value');
      LegacyUnit.equal(clone.parent, undefined);
      LegacyUnit.equal(clone.next, undefined);
      LegacyUnit.equal(clone.prev, undefined);

      node = new Node('b', 1);
      node.attr('id', 'id');
      node.attr('class', 'class');
      node.attr('title', 'title');
      clone = node.clone();
      LegacyUnit.equal(clone.name, 'b');
      LegacyUnit.equal(clone.type, 1);
      LegacyUnit.deepEqual(clone.attributes, [{ name: 'class', value: 'class' }, { name: 'title', value: 'title' }]);
      LegacyUnit.deepEqual(clone.attributes.map, { 'class': 'class', 'title': 'title' });
    });

    suite.test('unwrap', function () {
      var root, node1, node2, node3;

      root = new Node('#frag', 11);
      node1 = root.append(new Node('b', 1));
      node2 = node1.append(new Node('em', 1));
      node1.unwrap();
      ok(root.firstChild === node2, 'root.firstChild');
      ok(root.lastChild === node2, 'root.lastChild');
      ok(node2.parent === root, 'node2.parent');

      root = new Node('#frag', 11);
      node1 = root.append(new Node('b', 1));
      node2 = node1.append(new Node('em', 1));
      node3 = node1.append(new Node('span', 1));
      node1.unwrap();
      ok(root.firstChild === node2, 'root.firstChild');
      ok(root.lastChild === node3, 'root.lastChild');
      ok(node2.parent === root, 'node2.parent');
      ok(node3.parent === root, 'node3.parent');
    });

    suite.test('empty', function () {
      var root, node1;

      root = new Node('#frag', 11);
      node1 = root.append(new Node('b', 1));
      node1.empty();
      ok(root.firstChild === node1, 'root.firstChild');
      ok(root.lastChild === node1, 'root.firstChild');
      ok(!node1.firstChild, 'node1.firstChild');
      ok(!node1.lastChild, 'node1.firstChild');
    });

    suite.test('isEmpty', function () {
      var root, node1, node2;

      root = new Node('#frag', 11);
      node1 = root.append(new Node('p', 1));
      node2 = node1.append(new Node('b', 1));
      ok(root.isEmpty({ img: 1 }), 'Is empty 1');
      ok(node1.isEmpty({ img: 1 }), 'Is empty 2');

      root = new Node('#frag', 11);
      node1 = root.append(new Node('p', 1));
      node2 = node1.append(new Node('img', 1));
      ok(!root.isEmpty({ img: 1 }), 'Is not empty 1');
      ok(!node1.isEmpty({ img: 1 }), 'Is not empty 2');

      root = new Node('#frag', 11);
      node1 = root.append(new Node('p', 1));
      node2 = node1.append(new Node('#text', 3));
      node2.value = 'X';
      ok(!root.isEmpty({ img: 1 }), 'Is not empty 3');
      ok(!node1.isEmpty({ img: 1 }), 'Is not empty 4');

      root = new Node('#frag', 11);
      node1 = root.append(new Node('p', 1));
      node2 = node1.append(new Node('#text', 3));
      node2.value = '';
      ok(root.isEmpty({ img: 1 }), 'Is empty 4');
      ok(node1.isEmpty({ img: 1 }), 'Is empty 5');

      root = new Node('#frag', 11);
      node1 = root.append(new Node('a', 1)).attr('name', 'x');
      ok(!root.isEmpty({ img: 1 }), 'Contains anchor with name attribute.');
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);