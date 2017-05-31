define("mylib/App", ["mylib/auth/User"], function(User) {
	return {
		user: new User("UserName")
	};
});
