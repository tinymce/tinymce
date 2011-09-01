QUnit.config.reorder = false;
QUnit.config.autostart = false;

module("API", {
	autostart: false
});

(function() {
	test('tinymce - is', 9, function() {
		ok(!tinymce.is(null, 'test'));
		ok(!tinymce.is('', 'test'));
		ok(tinymce.is('', 'string'));
		ok(tinymce.is(3, 'number'));
		ok(tinymce.is(3.1, 'number'));
		ok(tinymce.is([], 'array'));
		ok(tinymce.is({}, 'object'));
		ok(tinymce.is(window.abc, 'undefined'));
		ok(!tinymce.is(window.abc));
	});

	test('tinymce - each', 6, function() {
		var c;

		c = 0;
		tinymce.each([1, 2, 3], function(v) {
			c += v;
		});
		equals(c, 6);

		c = 0;
		tinymce.each([1, 2, 3], function(v, i) {
			c += i;
		});
		equals(c, 3);

		c = 0;
		tinymce.each({a : 1, b : 2, c : 3}, function(v, i) {
			c += v;
		});
		equals(c, 6);

		c = '';
		tinymce.each({a : 1, b : 2, c : 3}, function(v, k) {
			c += k;
		});
		equals(c, 'abc');

		c = 0;
		tinymce.each(null, function(v) {
			c += v;
		});
		equals(c, 0);

		c = 0;
		tinymce.each(1, function(v) {
			c += v;
		});
		equals(c, 0);
	});

	test('tinymce - map', 1, function() {
		var c;

		c = tinymce.map([1,2,3], function(v) {
			return v + 1;
		});
		equals(c.join(','), '2,3,4');
	});

	test('tinymce - grep', 3, function() {
		var c;

		c = tinymce.grep([1,2,3,4], function(v) {
			return v > 2;
		});
		equals(c.join(','), '3,4');

		c = [1,2,3,4];
		c.test = 1
		c = tinymce.grep(c);
		ok(!c.test);
		equals(c.join(','), '1,2,3,4');
	});

	test('tinymce - explode', 2, function() {
		equals(tinymce.explode(' a, b, c ').join(','), 'a,b,c');
		equals(tinymce.explode(' a;  b; c ', ';').join(','), 'a,b,c');
	});

	test('tinymce - inArray', 4, function() {
		equals(tinymce.inArray([1,2,3], 2), 1);
		equals(tinymce.inArray([1,2,3], 7), -1);
		equals(tinymce.inArray({a : 1, b : 2, c : 3}, 2), -1);
		equals(tinymce.inArray(null, 7), -1);
	});

	test('tinymce - extend', 5, function() {
		var o;

		o = tinymce.extend({
			a : 1,
			b : 2,
			c : 3
		}, {
			a : 2,
			d : 4
		});

		equals(o.a, 2);
		equals(o.b, 2);
		equals(o.d, 4);

		o = tinymce.extend({
			a : 1,
			b : 2,
			c : 3
		}, {
			a : 2,
			d : 4
		}, {
			e : 5
		});

		equals(o.d, 4);
		equals(o.e, 5);
	});

	test('tinymce - trim', 5, function() {
		equals(tinymce.trim('a'), 'a');
		equals(tinymce.trim(' \r  a'), 'a');
		equals(tinymce.trim('a  \n  '), 'a');
		equals(tinymce.trim('   a  \t  '), 'a');
		equals(tinymce.trim(null), '');
	});

	test('tinymce - create', 13, function() {
		var o;

		tinymce.create('tinymce.Test1', {
			Test1 : function(c) {
				this.c = c;
				this.c++;
			},

			method1 : function() {
				this.c++;
			},

			method2 : function() {
				this.c++;
			}
		});

		tinymce.create('tinymce.Test2:tinymce.Test1', {
			Test2 : function(c) {
				this.parent(c);
				this.c += 2;
			},

			method1 : function() {
				this.c+=2;
			},

			method2 : function() {
				this.parent();
				this.c+=2;
			}
		});

		tinymce.create('tinymce.Test3:tinymce.Test2', {
			Test3 : function(c) {
				this.parent(c);
				this.c += 4;
			},

			method1 : function() {
				this.c+=2;
			},

			method2 : function() {
				this.parent();
				this.c+=3;
			}
		});

		tinymce.create('tinymce.Test4:tinymce.Test3', {
			method2 : function() {
				this.parent();
				this.c+=3;
			},

			'static' : {
				method3 : function() {
					return 3;
				}
			}
		});

		tinymce.create('static tinymce.Test5', {
			method1 : function() {
				return 3;
			}
		});

		o = new tinymce.Test1(3);
		equals(o.c, 4);
		o.method1();
		equals(o.c, 5);

		o = new tinymce.Test2(3);
		equals(o.c, 6);
		o.method1();
		equals(o.c, 8);
		o.method2();
		equals(o.c, 11);

		o = new tinymce.Test3(3);
		equals(o.c, 10);
		o.method1();
		equals(o.c, 12);
		o.method2();
		equals(o.c, 18);

		o = new tinymce.Test4(3);
		equals(o.c, 10);
		o.method1();
		equals(o.c, 12);
		o.method2();
		equals(o.c, 21);
		equals(tinymce.Test4.method3(), 3);

		equals(tinymce.Test5.method1(), 3);
	});

	test('tinymce - create in namespace', 1, function() {
		var o, myNS = {};

		tinymce.create('tinymce.Test1', {
		}, myNS);

		ok(myNS.tinymce.Test1);
	});

	test('tinymce - walk', 3, function() {
		var c;

		c = 0;
		tinymce.walk({
			a : {
				a1 : 1,
				a2 : 2,
				a3 : 3
			},

			b : {
				b1 : 4,
				b2 : {
					b21 : 5,
					b22 : 6,
					b23 : 7
				},
				b3 : 8
			}
		}, function(v) {
			if (tinymce.is(v, 'number'))
				c += v;
		});
		equals(c, 36);

		c = 0;
		tinymce.walk({
			items : [
				1,
				{items : [2, {a1 : 3, items : [4, 5], b1 : 6}, 7]},
				8
			]
		}, function(v) {
			if (tinymce.is(v, 'number'))
				c += v;
		}, 'items');
		equals(c, 27);

		c = 0;
		tinymce.walk(null);
		equals(c, 0);
	});

	test('tinymce - createNS', 2, function() {
		tinymce.createNS('a.b.c.d.e');
		a.b.c.d.e.x = 1;
		tinymce.createNS('a.b.c.d.e.f');
		a.b.c.d.e.f = 2;
		equals(a.b.c.d.e.x, 1);
		equals(a.b.c.d.e.f, 2);
	});

	test('tinymce - get', 2, function() {
		tinymce.createNS('a.b.c.d.e');
		a.b.c.d.e.x = 1;
		equals(tinymce.resolve('a.b.c.d.e.x'), 1);
		ok(!tinymce.resolve('a.b.c.d.e.y'));
	});
})();

tinymce.dom.Event.add(window, 'load', function() {
	// IE6 chokes if you stress it
	window.setTimeout(function() {
		QUnit.start();
	}, 1);
});
