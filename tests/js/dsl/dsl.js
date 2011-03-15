var editor;

function getFunctionName(func) {
	if (func.name && func.name != "") {
		return func.name;
	} else if (typeof func == "function" || typeof func == "object") {
	  	var fName = ("" + func).match(/function\s*([\w\$]+)\s*\(/);
	  	if (fName !== null && fName != "") {
	  		return fName[1];
	  	} else {
			for (var v in window) {
				if (window[v] === func) {
					func.name = v;
					return v;
				}
			}
		}
	}
}

function assertState(expected, message) {
	var content = editor.getContent().replace(/[\n\r]/g, '');
	if (expected && expected.replace) expected = expected.replace(/[\n\r]/g, '');
    // Safari reports "function", while Firefox and IE report "object"
    if (typeof expected == "function" || typeof expected == "object") {
        if (expected.test(content))
            equals(content, content, message);
        else 
            equals(content, expected.toString(), message);
    } else {
        equals(content, expected, message);
    }
}

tinymce.create('dsl.Queue', {
	Queue: function() {
		this.queue = [];
	},
	
	add: function(task) {
		this.queue.push(task);
	},
	
	next: function() {
		if (this.queue.length > 0) {
			var task = this.queue.shift();
			task();
			return true;
		} else {
			QUnit.start();
			return false;
		}
	},
	
	done: function() {
		expect(this.queue.length);
		this.next();
	}
});

tinymce.create('dsl.Action', {
	Action: function(name, action) {
		this.name = name;
		this.a = this.curryPreposition('a');
		this.inA = this.curryPreposition('in a');
		this.to = this.curryPreposition('to');
		if (tinymce.is(action, 'string')) {
			this.action = function(callback) {
				editor.execCommand(action);
				callback();
			};
		} else {
			this.action = action;
		}
	},
	
	curryPreposition: function(preposition) {
		return function(state) {
			return this.go(state, preposition);
		};
	},
	
	go: function(state, preposition) {
		var message = this.name + " " + preposition + " " + getFunctionName(state);
		var action = this.action;
		var actionPerformed = false;
		function defer(callback) {
			return function() {
				var args = arguments;
				queue.add(function() {
					if (actionPerformed) {
						callback.apply(undefined, args);
						queue.next();
						return;
					}
					editor.focus();
					state();
					action(function() {
						actionPerformed = true;
						callback.apply(undefined, args);
						queue.next();
					});
				});
				return this;
			};
		}
		
		var dslState = {
			gives: defer(function(expected) {
				assertState(expected, message);
			}),

			enablesState: defer(function(state) {
				ok(editor.queryCommandState(state), message + " enables " + state + " command");
			}),
			
			disablesState: defer(function(state) {
				ok(!editor.queryCommandState(state), message + " disables " + state + " command");
			})
		};
		dslState.andGives = dslState.gives;
		return dslState;
	}
});


// Action Utilities
function fakeKeyPressAction(keyCode, shiftKey) {
	return function(callback) {
		setTimeout(function() {
			window.robot.type(keyCode, shiftKey, callback, editor.selection.getNode());
		}, 1);
	};
}

function createAction(name, action) {
	window[name.replace(/\s+/g, '')] = new dsl.Action(name, action);
}