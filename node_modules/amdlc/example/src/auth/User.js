define("mylib/auth/User", ["mylib/auth/Group", "mylib/data/Info"], function(Group, Info) {
	return function(name) {
		this.name = name;
		this.group = new Group("admins");
		this.info = new Info({size: 42});
	};
});
