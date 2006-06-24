var TinyUnit = {
	_failures : new Array(),
	_currentTest : '',
	_assertCount : 0,

	init : function(s) {
	},

	assert : function(/*[comment], boolean_value*/) {
		var v = TinyUnit.getValueArg(arguments);
		var c = TinyUnit.getCommentArg(arguments);

		if (!v)
			TinyUnit._failures[TinyUnit._failures.length] = c;

		TinyUnit._assertCount++;
	},

	getValueArg : function(a) {
		if (a.length > 1)
			return a[1];

		return a[0];
	},

	getCommentArg : function(a) {
		if (a.length > 1)
			return 'Assert ' + TinyUnit._assertCount + ' failed, ' + a[0] + '.';

		return 'Assert ' + TinyUnit._assertCount + ' failed. ';
	},

	run : function(t) {
		var n, d = document, r = d.getElementById('result'), e, h, i;

		for (n in t) {
			// Reset states
			TinyUnit._assertCount = 0;
			TinyUnit._failures = new Array();
			TinyUnit._currentTest = n;
			h = '';

			// Run test
			t[n]();

			// Create failure
			if (TinyUnit._failures.length > 0) {
				h = '<div class="failedtest"><div>Test \"' + n + '\" failed, assers: ' + TinyUnit._assertCount + ', failures: ' + TinyUnit._failures.length + ':</div>';

				for (i=0; i<TinyUnit._failures.length; i++)
					h += '<div class="failed">' + TinyUnit._failures[i] + '</div>';

				h += '</div>';
			} else
				h = '<div class="passedtest">Test \"' + n + '\" passed, assers: ' + TinyUnit._assertCount + '.</div>';

			e = d.createElement("div");
			e.innerHTML = h;

			r.appendChild(e);
		}
	}
};
