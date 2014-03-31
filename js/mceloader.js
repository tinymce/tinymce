
(function(){
if (document.createComment){
	document.write('<'+'script src="tiny_mce/tiny_mce_src.js" type="text/javascript"><'+'/script>');
} else {
	window.tinyMCE={
		init:function(){},
		get:function(id){
			var d=document.getElementById(id);
			d.getContent=function(){return d.value;};
			return d;
		}
	}
}
})();
