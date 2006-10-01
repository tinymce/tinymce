<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="ISO-8859-1"	indent="no" />
	<xsl:param name="search"><!-- Gets set by doctool --></xsl:param>

	<xsl:template match="/">
		<html>
			<head>
				<title><xsl:value-of select="//doc/@name" /></title>
				<meta http-equiv="Content-Type"	content="text/html; charset=UTF-8" />
				<link href="api_docs.css" rel="stylesheet" type="text/css" />
				<xsl:if test="$search = 'true'">
					<script type="text/javascript" src="search.js"></script>
				</xsl:if>
			</head>
			<body>
				<h1 class="title"><xsl:value-of select="//doc/@name" disable-output-escaping="yes" /></h1>

				<div id="navigation">
					<a href="index.htm" class="indexlink"><xsl:value-of select="//doc/@name" disable-output-escaping="yes" /></a>

					<div id="classlist">
						<h4>Classes</h4>
						<ul>
							<xsl:for-each select="//class">
								<xsl:sort select="@name" />
								<li><a><xsl:attribute name="href">class_<xsl:value-of select="@name"/>.htm</xsl:attribute><xsl:value-of	select="@name"/></a></li>
							</xsl:for-each>
						</ul>
					</div>

					<xsl:if test="$search = 'true'">
						<div class="search">
							<form action="javascript:void(0);" onsubmit="return Search.exec(this.query.value,'searchresult','maincontent');">
								<label id="querylabel" for="query">Search:</label>
								<input type="text" id="query" name="query" value="" />
							</form>
						</div>
					</xsl:if>
				</div>

				<div id="searchresult">
				</div>

				<div id="maincontent">
					<div class="summary">
						<xsl:value-of select="//doc/summary/text()" disable-output-escaping="yes" />
					</div>
				</div>

				<br style="clear: both"	/>

				<div class="footer">
					<xsl:value-of select="//doc/footer/text()" disable-output-escaping="yes" />
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>