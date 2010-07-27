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
    // Safari reports "function", while Firefox and IE report "object"
    if (typeof expected == "function" || typeof expected == "object") {
        if (expected.test(editor.getContent()))
            equals(editor.getContent(), editor.getContent(), message);
        else 
            equals(editor.getContent(), expected.toString(), message);
    } else {
        equals(editor.getContent(), expected, message);
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
		//QUnit.start();
	}
});

tinymce.create('dsl.Action', {
	Action: function(name, action) {
		this.name = name;
		this.a = this.curryPreposition('a');
		this.inA = this.curryPreposition('in a');
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
			return this.to(state, preposition);
		};
	},
	
	to: function(state, preposition) {
		if (!preposition) {
			preposition = 'to';
		}
		var message = this.name + " " + preposition + " " + getFunctionName(state);
		var action = this.action;
		return {
			gives: function(expected) {
				queue.add(function() {
					editor.focus();
					state();
					action(function() {
						assertState(expected, message);
						queue.next();
					});
				});
			}
		};
	},
	
	gives: function(expected) {
		fail();
		assertState(expected, this.message);
	}
});