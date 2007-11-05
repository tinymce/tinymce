/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var each = tinymce.each, DOM = tinymce.DOM;

	/**
	 * This class is a simple Unit testing class. Provides simple methods for
	 * test case and asserts execution.
	 * XML Parser class. This class is only available for the dev version of TinyMCE.
	 */
	tinymce.create('tinymce.util.UnitTester', {
		/**
		 * Constructs a new UnitTester instance.
		 *
		 * @param {String} id Element ID to log execution events to.
		 * @param {Object} s Optional settings object.
		 */
		UnitTester : function(id, s) {
			this.id = id;
			this.cases = {};
			this.settings = tinymce.extend({
				debug : false,
				log_skipped : false
			}, s);
		},

		/**
		 * Fakes a mouse event.
		 *
		 * @param {Element/String} e DOM element object or element id to send fake event to.
		 * @param {String} na Event name to fake like "click".
		 * @param {Object} o Optional object with data to send with the event like cordinates.
		 */
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

		/**
		 * Fakes a key event.
		 *
		 * @param {Element/String} e DOM element object or element id to send fake event to.
		 * @param {String} na Event name to fake like "keydown".
		 * @param {Object} o Optional object with data to send with the event like keyCode and charCode.
		 */
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

		/**
		 * Adds a test with units.
		 *
		 * @param {String} n Name of test.
		 * @param {Object} t Name/Value collection with functions to be executed.
		 */
		add : function(n, t) {
			this.cases[n] = t;
		},

		/**
		 * Resets the UnitTester and removes any contents from the log.
		 */
		reset : function() {
			DOM.get(this.id).innerHTML = '';
		},

		/**
		 * TODO: FIX ME!
		 */
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

		/**
		 * Runs the test(s). Default is execution of all added tests and units.
		 *
		 * @param {String} Optional test name to execute.
		 * @param {String} Optional unit to execute inside the test.
		 */
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

		/**
		 * String format function.
		 *
		 * @param {String} s String with %d %s things that gets replaced.
		 * @param {Object} .. Optional arguments to be placed in string.
		 * @return {String} Formatted string.
		 */
		format : function(s) {
			var i = 1, a = arguments;

			return s.replace(/%([ds])/g, function(m, t) {
				return '' + a[i++];
			});
		},

		/**
		 * Checks if the specified input param is true.
		 *
		 * @param {bool} e Object/item to check if true.
		 * @param {String} m Optional message to output.
		 * @param {bool} sk Skip error output if this is true.
		 */
		is : function(e, m, sk) {
			this.stats.asserts++;

			if (!e)
				this.fail(this.format(m || '[%d] Assert failed, value not true: %s', this.assertCount, e), sk);

			this.assertCount++;
		},
	
		/**
		 * Checks if the specified input param equals another param.
		 *
		 * @param {Object} v1 Object/item to check.
		 * @param {Object} v2 Object/item to check.
		 * @param {String} m Optional message to output.
		 * @param {bool} sk Skip error output if this is true.
		 */
		eq : function(v1, v2, m, sk) {
			this.stats.asserts++;

			if (v1 !== v2)
				this.fail(this.format(m || '[%d] Assert failed, values are not equal: was "%s", expected "%s"', this.assertCount, '' + v1, '' + v2), sk);

			this.assertCount++;
		},

		/**
		 * Checks if the specified input param unequal to the other param.
		 *
		 * @param {Object} v1 Object/item to check.
		 * @param {Object} v2 Object/item to check.
		 * @param {String} m Optional message to output.
		 * @param {bool} sk Skip error output if this is true.
		 */
		neq : function(v1, v2, m, sk) {
			this.stats.asserts++;

			if (v1 == v2)
				this.fail(this.format(m || '[%d] Assert failed, values are equal: %s, %s', this.assertCount, v1, v2), sk);

			this.assertCount++;
		},

		/**
		 * Adds a failure message to the log.
		 *
		 * @param {String} m Message to output.
		 * @param {bool} sk Skip error output if this is true.
		 */
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

		/**
		 * Logs a failure message.
		 *
		 * @param {string} .. Things to log.
		 */
		logFailure : function() {
			var t = this;

			DOM.add(DOM.get(t.id), 'div', {'class' : 'failure'}, DOM.encode(Array.prototype.join.call(arguments, ',')));

			if (window.console && window.console.debug)
				console.debug(arguments);
		},

		/**
		 * Logs a message.
		 *
		 * @param {string} .. Things to log.
		 */
		log : function() {
			DOM.add(DOM.get(this.id), 'div', null, DOM.encode(Array.prototype.join.call(arguments, ',')).replace(/\r?\n/g, '<br />'));
		},

		/**
		 * Logs a success message.
		 *
		 * @param {string} .. Things to log.
		 */
		logSuccess : function() {
			DOM.add(DOM.get(this.id), 'div', {'class' : 'success'}, DOM.encode(Array.prototype.join.call(arguments, ',')));
		}
	});
})();
