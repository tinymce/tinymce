/**
 * $Id: TinyMCE_DOMUtils.class.js 91 2006-10-02 14:53:22Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var each = tinymce.each, DOM = tinymce.DOM;

	tinymce.create('tinymce.util.UnitTester', {
		UnitTester : function(id, s) {
			this.id = id;
			this.cases = {};
			this.settings = tinymce.extend({
				debug : false,
				log_skipped : false
			}, s);
		},

		fakeMouseEvent : function(e, na, o) {
			var ev;

			o = tinymce.extend({
				screenX : 0,
				screenY : 0,
				clientX : 0,
				clientY : 0
			}, o);

			e = DOM.get(e);

			if (e.fireEvent) {
				ev = document.createEventObject();
				tinymce.extend(ev, o);
				e.fireEvent('on' + na, ev);
				return;
			}

			ev = document.createEvent('MouseEvents');

			if (ev.initMouseEvent)
				ev.initMouseEvent(na, true, true, window, 1, o.screenX, o.screenY, o.clientX, o.clientY, false, false, true, false, 0, null);

			e.dispatchEvent(ev);
		},

		fakeKeyEvent : function(e, na, o) {
			var ev;

			o = tinymce.extend({
				keyCode : 13,
				charCode : 0
			}, o);

			e = DOM.get(e);

			if (e.fireEvent) {
				ev = document.createEventObject();
				tinymce.extend(ev, o);
				e.fireEvent('on' + na, ev);
				return;
			}

			if (window.KeyEvent) {
				ev = document.createEvent('KeyEvents');
				ev.initKeyEvent(na, true, true, window, false, false, false, false, o.keyCode, o.charCode);
			} else {
				ev = document.createEvent('UIEvents');

				if (ev.initUIEvent)
					ev.initUIEvent(na, true, true, window, 1);

				ev.keyCode = o.keyCode;
				ev.charCode = o.charCode;
			}

			e.dispatchEvent(ev);
		},

		add : function(n, t) {
			this.cases[n] = t;
		},

		reset : function() {
			DOM.get(this.id).innerHTML = '';
		},

		runAsync : function(n, te) {
			var t = this, c, st;

			if (!t.started) {
				st = t.stats = {
					tests : 0,
					asserts : 0,
					failed_tests : 0,
					failed_asserts : 0,
					skipped_asserts : 0,
					exceptions : 0,
					total : 0
				};

				t.started = 1;

				each(t.cases, function(c) {
					each(c, function(x, k) {
						if (k == 'setup' || k == 'teardown')
								return;

						if (te && k != te)
							return;

						st.total++;
					});
				});
			}

			c = t.cases[n];

			if (c.setup)
				c.setup.call(t);

			each(c, function(v, k) {
				if (k == 'setup' || k == 'teardown')
						return;

				if (te && k != te)
					return;

				st.tests++;
				t.failedTest = 0;
				t.assertCount = 0;

				t.log('Running test: ' + n + '.' + k + ' (' + st.tests + '/' + st.total + ')');

				if (!t.settings.debug) {
					try {
						v.call(t);
					} catch (ex) {
						t.logFailure('Exception occured:', ex);
						st.exceptions++;
						t.failedTest = 1;
						}
				} else
					v.call(t);

				if (t.failedTest)
					st.failed_tests++;
			});

			if (c.teardown)
				c.teardown.call(t);

			if (st.tests >= st.total) {
				if (st.failed_tests > 0) {
					t.logFailure(t.format('Runned %d of %d tests, %d failed.', st.tests, st.tests, st.failed_tests));
					t.logFailure(t.format('Runned %d of %d asserts, %d failed.', st.asserts, st.asserts, st.failed_asserts));

					if (st.skipped_asserts > 0)
						t.logFailure(t.format('Due to browser bugs %d asserts where skipped.', st.skipped_asserts));
				} else {
					t.logSuccess(t.format('Runned %d of %d tests, %d failed.', st.tests, st.tests, st.failed_tests));
					t.logSuccess(t.format('Runned %d of %d asserts, %d failed.', st.asserts, st.asserts, st.failed_asserts));

					if (st.skipped_asserts > 0)
						t.logSuccess(t.format('Due to browser bugs %d asserts where skipped.', st.skipped_asserts));
				}

				t.started = 0;
			}
		},

		run : function(n, te) {
			var t = this, st, o;

			st = t.stats = {
				tests : 0,
				asserts : 0,
				failed_tests : 0,
				failed_asserts : 0,
				skipped_asserts : 0,
				exceptions : 0
			};

			if (n) {
				o = {};
				o[n] = this.cases[n];
			} else
				o = this.cases;

			each(o, function(c, n) {
				var tc = 0;

				if (c.setup)
					c.setup.call(t);

				each(c, function(v, k) {
					if (k == 'setup' || k == 'teardown')
						return;

					if (te && k != te)
						return;

					st.tests++;
					t.failedTest = 0;
					t.assertCount = 0;

					t.log('Running test: ' + n + '.' + k);

					if (!t.settings.debug) {
						try {
							v.call(t);
						} catch (ex) {
							t.logFailure('Exception occured:', ex);
							st.exceptions++;
							t.failedTest = 1;
						}
					} else
						v.call(t);

					if (t.failedTest)
						st.failed_tests++;
				});

				if (c.teardown)
					c.teardown.call(t);
			});

			if (st.failed_tests > 0) {
				t.logFailure(t.format('Runned %d of %d tests, %d failed.', st.tests, st.tests, st.failed_tests));
				t.logFailure(t.format('Runned %d of %d asserts, %d failed.', st.asserts, st.asserts, st.failed_asserts));

				if (st.skipped_asserts > 0)
					t.logFailure(t.format('Due to browser bugs %d asserts where skipped.', st.skipped_asserts));
			} else {
				t.logSuccess(t.format('Runned %d of %d tests, %d failed.', st.tests, st.tests, st.failed_tests));
				t.logSuccess(t.format('Runned %d of %d asserts, %d failed.', st.asserts, st.asserts, st.failed_asserts));

				if (st.skipped_asserts > 0)
					t.logSuccess(t.format('Due to browser bugs %d asserts where skipped.', st.skipped_asserts));
			}
		},

		format : function(s) {
			var i = 1, a = arguments;

			return s.replace(/%([ds])/g, function(m, t) {
				return a[i++];
			});
		},

		is : function(e, m, sk) {
			this.stats.asserts++;

			if (!e)
				this.fail(this.format(m || '[%d] Assert failed, value not true: %s', this.assertCount, e), sk);

			this.assertCount++;
		},

		eq : function(v1, v2, m, sk) {
			this.stats.asserts++;

			if (v1 !== v2)
				this.fail(this.format(m || '[%d] Assert failed, values are not equal: was "%s", expected "%s"', this.assertCount, v1, v2), sk);

			this.assertCount++;
		},

		neq : function(v1, v2, m, sk) {
			this.stats.asserts++;

			if (v1 == v2)
				this.fail(this.format(m || '[%d] Assert failed, values are equal: %s, %s', this.assertCount, v1, v2), sk);

			this.assertCount++;
		},

		fail : function(m, sk) {
			var t = this;

			if (sk) {
				t.stats.skipped_asserts++;
				if (t.settings.log_skipped)
					t.log('Skipped: ' + m);

				return;
			}

			t.stats.failed_asserts++;
			t.failedTest = 1;
			t.logFailure(m);
		},

		logFailure : function() {
			var t = this;

			DOM.add(DOM.get(t.id), 'div', {'class' : 'failure'}, DOM.encode(Array.prototype.join.call(arguments, ',')));

			if (window.console && window.console.debug)
				console.debug(arguments);
		},

		log : function() {
			DOM.add(DOM.get(this.id), 'div', null, DOM.encode(Array.prototype.join.call(arguments, ',')).replace(/\r?\n/g, '<br />'));
		},

		logSuccess : function() {
			DOM.add(DOM.get(this.id), 'div', {'class' : 'success'}, DOM.encode(Array.prototype.join.call(arguments, ',')));
		}
	});
})();
