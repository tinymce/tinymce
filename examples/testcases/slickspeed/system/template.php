<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" debug="true">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	
	<script type="text/javascript" src="../frameworks/<?php echo $_GET['include']; ?>"></script>
	
	<script type="text/javascript">
		
		var get_length = function(elements){
			return (typeof elements.length == 'function') ? elements.length() : elements.length;
		}
	
		function test(selector){
			try {
				var start = new Date().getTime();
				var i = 1;
				var elements = <?php echo $_GET['function']; ?>(selector);
				var step = (new Date().getTime() - start);
				if (step > 750) return {'time': step, 'found': get_length(elements)};
				i ++;
				<?php echo $_GET['function']; ?>(selector);
				i ++;
				<?php echo $_GET['function']; ?>(selector);
				i ++;
				<?php echo $_GET['function']; ?>(selector);
				var end = (new Date().getTime() - start) / i;
				return {'time': Math.round(end), 'found': get_length(elements)};
			} catch(err){
				if (elements == undefined) elements = {length: -1};
				return ({'time': (new Date().getTime() - start) / i, 'found': get_length(elements), 'error': err});
			}

		};
	
	</script>
	
</head>

<body>
	
	<?php include('../template.html');?>

</body>
</html>