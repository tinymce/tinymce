define('tinymce.media.core.Size', [
], function () {
	var trimPx = function (value) {
		return value.replace(/px$/, '');
	};

	var addPx = function (value) {
		return /^[0-9.]+$/.test(value) ? (value + 'px') : value;
	};

	var getSize = function (name) {
		return function (elm) {
			return elm ? trimPx(elm.style[name]) : '';
		};
	};

	var setSize = function (name) {
		return function (elm, value) {
			if (elm) {
				elm.style[name] = addPx(value);
			}
		};
	};

	return {
		getMaxWidth: getSize('maxWidth'),
		getMaxHeight: getSize('maxHeight'),
		setMaxWidth: setSize('maxWidth'),
		setMaxHeight: setSize('maxHeight')
	};
});