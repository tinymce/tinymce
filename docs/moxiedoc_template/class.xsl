<?xml version="1.0" ?>
<xsl:stylesheet	version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:moxie="urn:moxie">
	<xsl:output method="html" encoding="ISO-8859-1"	indent="no" />
	<xsl:param name="targetclass"><!-- Gets set by doctool --></xsl:param>
	<xsl:param name="search"><!-- Gets set by doctool --></xsl:param>

	<xsl:template match="/">
		<html>
			<head>
				<title>Class: <xsl:value-of select="$targetclass" /></title>
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
					<div id="classview">
						<xsl:for-each select="//class[@name=$targetclass]">
							<div class="inheritagelist">Object<br /><xsl:call-template name="base_classes" /></div>

							<h3>Class <xsl:value-of	select="@name"/><xsl:if	test="@base"> extends <xsl:call-template name="data_type"><xsl:with-param name="get">base</xsl:with-param></xsl:call-template></xsl:if></h3>

							<div class="section">
								<div class="longsummary"><xsl:value-of select="summary/text()" disable-output-escaping="yes" /></div>
							</div>

							<!-- Short summaries -->

							<xsl:if	test="count(field) != 0">
								<div class="section">
									<table class="fieldsummary">
										<caption>Field Summary</caption>
										<xsl:for-each select="field">
											<xsl:sort select="@name" />
											<tr>
												<td class="datatype"><xsl:call-template	name="data_type" /></td>
												<td>
													<a><xsl:attribute name="href">#<xsl:value-of select="@name"/></xsl:attribute><xsl:value-of select="@name"/></a>
													<div class="shortsummary"><xsl:call-template name="short_summary" /></div>
												</td>
											</tr>
										</xsl:for-each>
									</table>
								</div>
							</xsl:if>

							<xsl:if	test="count(constructor) != 0">
								<div class="section">
									<table class="constructorsummary">
										<caption>Constructor Summary</caption>
										<xsl:for-each select="constructor">
											<xsl:sort select="@name" />
											<tr>
												<td>
													<a><xsl:attribute name="href">#<xsl:value-of select="@name" /></xsl:attribute><xsl:value-of select="@name" /></a><xsl:call-template name="function_layout"><xsl:with-param name="mode">bare</xsl:with-param></xsl:call-template>
													<div class="shortsummary"><xsl:call-template name="short_summary" /></div>
												</td>
											</tr>
										</xsl:for-each>
									</table>
								</div>
							</xsl:if>

							<xsl:if	test="count(method) != 0">
								<div class="section">
									<table class="methodsummary">
										<caption>Method	Summary</caption>
										<xsl:for-each select="method">
											<xsl:sort select="@name" />
											<tr>
												<td class="datatype"><xsl:call-template	name="data_type"><xsl:with-param name="get">return</xsl:with-param></xsl:call-template></td>
												<td>
													<a><xsl:attribute name="href">#<xsl:value-of select="@name"/></xsl:attribute><xsl:value-of select="@name"/></a><xsl:call-template name="function_layout"><xsl:with-param name="mode">bare</xsl:with-param></xsl:call-template>
													<div class="shortsummary"><xsl:call-template name="short_summary" /></div>
												</td>
											</tr>
										</xsl:for-each>
									</table>
								</div>
							</xsl:if>

							<xsl:call-template name="inherited_methods" />

							<!-- /Short summaries -->

							<!-- Details -->

							<xsl:if	test="count(field) != 0">
								<div class="section field details">
									<h3><a name="field_detail">Field Detail</a></h3>

									<div class="content">
										<xsl:for-each select="field">
											<xsl:sort select="@name" />
											<h4><a><xsl:attribute name="name"><xsl:value-of	select="@name"/></xsl:attribute><xsl:value-of select="@name"/></a></h4>
											<div class="layout"><xsl:call-template name="function_layout" /></div>
											<div class="detail">
												<div class="longsummary"><xsl:value-of select="summary/text()" disable-output-escaping="yes" /></div>
											</div>

											<xsl:if	test="position() != last()"><hr	/></xsl:if>
										</xsl:for-each>
									</div>
								</div>
							</xsl:if>

							<xsl:if	test="count(constructor) != 0">
								<div class="section constructor	details">
									<h3><a name="constructor_detail">Constructor Detail</a></h3>

									<div class="content">
										<xsl:for-each select="constructor">
											<xsl:sort select="@name" />
											<h4><a><xsl:attribute name="name"><xsl:value-of	select="@name"/></xsl:attribute><xsl:value-of select="@name"/></a></h4>
											<div class="layout"><xsl:call-template name="function_layout" /></div>
											<div class="detail">
												<div class="longsummary"><xsl:value-of select="summary/text()" disable-output-escaping="yes" /></div>

												<xsl:if	test="count(param) != 0">
													<div class="params">
														<h4>Parameters</h4>
														<xsl:for-each select="param">
															<div class="param"><xsl:value-of select="@name"/> - <xsl:value-of select="@summary"/></div>
														</xsl:for-each>
													</div>
												</xsl:if>
											</div>

											<xsl:if	test="position() != last()"><hr	/></xsl:if>
										</xsl:for-each>
									</div>
								</div>
							</xsl:if>

							<xsl:if	test="count(method) != 0">
								<div class="section method details">
									<h3><a name="method_detail">Method Detail</a></h3>

									<div class="content">
										<xsl:for-each select="method">
											<xsl:sort select="@name" />
											<h4><a><xsl:attribute name="name"><xsl:value-of	select="@name"/></xsl:attribute><xsl:value-of select="@name"/></a></h4>
											<div class="layout"><xsl:call-template name="function_layout" /></div>
											<div class="detail">
												<div class="longsummary"><xsl:value-of select="summary/text()" disable-output-escaping="yes" /></div>

												<xsl:if	test="count(param) != 0">
													<div class="params">
														<h4>Parameters</h4>
														<xsl:for-each select="param">
															<div class="param"><xsl:value-of select="@name"/> - <xsl:value-of select="@summary"/></div>
														</xsl:for-each>
													</div>
												</xsl:if>

												<xsl:if	test="return[@summary]">
													<h4>Returns</h4>
													<div class="longsummary	return"><xsl:value-of select="return/@summary"/></div>
												</xsl:if>
											</div>

											<xsl:if	test="position() != last()"><hr	/></xsl:if>
										</xsl:for-each>
									</div>
								</div>
							</xsl:if>

							<!-- /Details -->
						</xsl:for-each>
					</div>
				</div>

				<br style="clear: both"	/>

				<div class="footer">
					<xsl:value-of select="//doc/footer/text()" disable-output-escaping="yes" />
				</div>
			</body>
		</html>
	</xsl:template>

	<xsl:template name="base_classes">
		<xsl:param name="index"	select="'0'" />

		<xsl:variable name="base"><xsl:value-of	select="moxie:GetBaseClass(@name, $index)" /></xsl:variable>

		<xsl:if	test="$base != ''">
			<div class="baseclass">
				<xsl:if	test="$base = @name">
					<strong><xsl:value-of select="$base"/></strong><br />
				</xsl:if>

				<xsl:if	test="$base != @name">
					<a><xsl:attribute name="href">class_<xsl:value-of select="$base"/>.htm</xsl:attribute><xsl:value-of select="$base"/></a>
				</xsl:if>

				<xsl:call-template name="base_classes">
					<xsl:with-param	name="index"><xsl:value-of select="$index + 1" /></xsl:with-param>
				</xsl:call-template>
			</div>
		</xsl:if>
	</xsl:template>

	<xsl:template name="inherited_methods">
		<xsl:if	test="@base"> 
			<xsl:variable name="base"><xsl:value-of	select="@base"/></xsl:variable>

			<div class="section">
				<table class="inheritedmethodssummary">
					<caption>Methods inherited from	<xsl:call-template name="data_type"><xsl:with-param name="get">base</xsl:with-param></xsl:call-template></caption>
					<tr>
						<td>
							<xsl:if	test="count(//class[@name=$base])">
								<xsl:for-each select="//class[@name=$base]/method"><a><xsl:attribute name="href">class_<xsl:value-of select="$base"/>.htm#<xsl:value-of	select="@name"/></xsl:attribute><xsl:value-of select="@name"/></a><xsl:if test="position() != last()">,	</xsl:if></xsl:for-each>
							</xsl:if>
						</td>
					</tr>
				</table>
			</div>

			<xsl:if	test="count(//class[@name=$base])">
				<xsl:for-each select="//class[@name=$base]">
					<xsl:call-template name="inherited_methods" />
				</xsl:for-each>
			</xsl:if>
		</xsl:if>
	</xsl:template>

	<xsl:template name="short_summary">
		<xsl:variable name="summary"><xsl:value-of select="substring-before(summary/text(), '.')" />.</xsl:variable>
		<xsl:if test="$summary = '.'"><xsl:value-of select="substring(summary/text(), 0, 150)" disable-output-escaping="yes" /></xsl:if>
		<xsl:if test="$summary != '.'"><xsl:value-of select="$summary" disable-output-escaping="yes" /></xsl:if>
	</xsl:template>

	<xsl:template name="data_type">
		<xsl:param name="get" select="'argument'" />

		<xsl:if	test="$get = 'return'">
			<xsl:variable name="returntype"><xsl:value-of select="return/@type" /></xsl:variable>

			<xsl:call-template name="member_prefix" />

			<xsl:if	test="count(//class[@name=$returntype])	!= 0">
				<a><xsl:attribute name="href">class_<xsl:value-of select="$returntype"/>.htm</xsl:attribute><xsl:value-of select="$returntype"/></a>
			</xsl:if>

			<xsl:if	test="count(//class[@name=$returntype])	= 0">
				<xsl:value-of select="$returntype" />
			</xsl:if>
		</xsl:if>

		<xsl:if	test="$get = 'base'">
			<xsl:variable name="basetype"><xsl:value-of select="@base" /></xsl:variable>

			<xsl:if	test="count(//class[@name=$basetype]) != 0">
				<a><xsl:attribute name="href">class_<xsl:value-of select="$basetype"/>.htm</xsl:attribute><xsl:value-of	select="$basetype"/></a>
			</xsl:if>

			<xsl:if	test="count(//class[@name=$basetype]) =	0">
				<xsl:value-of select="$basetype" />
			</xsl:if>
		</xsl:if>

		<xsl:if	test="$get = 'argument'">
			<xsl:variable name="type"><xsl:value-of	select="@type" /></xsl:variable>

			<xsl:call-template name="member_prefix" />

			<xsl:if	test="count(//class[@name=$type]) != 0">
				<a><xsl:attribute name="href">class_<xsl:value-of select="@type"/>.htm</xsl:attribute><xsl:value-of select="@type"/></a>
			</xsl:if>

			<xsl:if	test="count(//class[@name=$type]) = 0">
				<xsl:value-of select="@type" />
			</xsl:if>
		</xsl:if>
	</xsl:template>

	<xsl:template name="member_prefix">
		<xsl:if	test="@private = '1'">&lt;private&gt; </xsl:if>
		<xsl:if	test="@abstract = '1'">&lt;abstract&gt; </xsl:if>
		<xsl:if	test="@static = '1'">&lt;static&gt; </xsl:if>
	</xsl:template>

	<xsl:template name="function_layout">
		<xsl:param name="mode" select="'full'" />

		<xsl:call-template name="member_prefix" />

		<xsl:if	test="name() !=	'constructor'">
			<xsl:if	test="$mode='full'">
				<xsl:value-of select="return/@type"/>
				<xsl:text> </xsl:text>
			</xsl:if>
		</xsl:if>

		<xsl:if	test="name() = 'constructor'">
			<xsl:if	test="$mode='full'"><xsl:value-of select="@name"/></xsl:if>(<xsl:for-each select="param">&lt;<xsl:call-template name="data_type" />&gt;	<xsl:value-of select="@name"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>)
		</xsl:if>

		<xsl:if	test="name() = 'method'">
			<xsl:if	test="$mode='full'"><xsl:value-of select="@name"/></xsl:if>(<xsl:for-each select="param">&lt;<xsl:call-template name="data_type" />&gt;	<xsl:value-of select="@name"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>)
		</xsl:if>

		<xsl:if	test="name() = 'field'">
			<xsl:value-of select="@type"/><xsl:text> </xsl:text><xsl:value-of select="@name"/>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>