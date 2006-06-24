<html>
<head>
<title>Displays the output of a TinyMCE</title>
</head>
<body>

<h2>HTML output from post</h2>

<table border="1" width="100%">
	<tr bgcolor="#CCCCCC"><td width="1%" nowrap="nowrap"><strong>Form element</strong></td><td><strong>HTML output</strong></td></tr>
	<? foreach ($_POST as $name => $value) { ?>
		<tr><td width="1%" nowrap="nowrap"><?=$name?></td><td><?=stripslashes($value)?></td></tr>
	<? } ?>
</table>

<h2>Source output from post</h2>

<table border="1" width="100%">
	<tr bgcolor="#CCCCCC"><td width="1%" nowrap="nowrap"><strong>Form element</td><td><strong>Source output</strong></td></tr>
	<? foreach ($_POST as $name => $value) { ?>
		<tr><td width="1%" nowrap="nowrap"><?=$name?></td><td><?=htmlentities(stripslashes($value))?></td></tr>
	<? } ?>
</table>

</body>
</html>

