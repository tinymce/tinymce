// Configure require.js to load mylib without a mylib root directory
requirejs.config({
	paths: {
		mylib: '.'
	}
});

// Execute main logic
define(["mylib/App"], function(App) {
	alert(App.user.name);
});
