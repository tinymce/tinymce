
var log = exports.colorLog = {
	ANSIColors: {
		green:  '\033[32m',
		red:    '\033[31m',
		cyan:   '\033[36m',
		yellow: '\033[1;33m',
		normal: '\033[0m'
	},
	log: function(msg, color){
		console.log((this.ANSIColors[color] || this.ANSIColors.normal) + msg + this.ANSIColors.normal);
	}
};
for (var col in log.ANSIColors) (function(col){
	log[col] = function(msg){
		this.log(msg, col);
	};
})(col);


