<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:output
		method="xml"
		indent="yes"
		omit-xml-declaration="yes"
		doctype-system="http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"
		doctype-public="-//W3C//DTD XHTML 1.1//EN"
	/>

	<xsl:param name="target" />

	<xsl:template match="/">
		<html>
		<head>
			<title>Member: <xsl:value-of select="//class[@fullname=$target]/@fullname" /></title>
			<xsl:text disable-output-escaping="yes"><![CDATA[
<meta name="generator" content="MoxieDoc" />

<link rel="stylesheet" type="text/css" href="css/reset.css" />
<link rel="stylesheet" type="text/css" href="css/grids.css" />
<link rel="stylesheet" type="text/css" href="css/general.css" />

<script type="text/javascript" src="http://www.google.com/jsapi"></script>
<script type="text/javascript">
	google.load("jquery", "1.3");
</script>
<script type="text/javascript" src="js/jquery.treeview.min.js"></script>
<script type="text/javascript" src="js/general.js"></script>
]]></xsl:text>
		</head>
		<body>
			<div class="details memberDetailsContent">
				<xsl:for-each select="/method[@fullname=$target]|//property[@fullname=$target]|//event[@fullname=$target]">
					<h1><xsl:value-of select="@fullname" /></h1>

					<div class="memberDetails last">
						<xsl:attribute name="id"><xsl:value-of select="@name" /></xsl:attribute>

						<h3>
							<xsl:value-of select="@name" />

							<span class="memberType">
								<xsl:choose>
									<xsl:when test="@constructor">constructor</xsl:when>
									<xsl:otherwise><xsl:value-of select="name()" /></xsl:otherwise>
								</xsl:choose>
							</span>
						</h3>

						<code class="syntax">
							<xsl:choose>
								<xsl:when test="@protected">protected </xsl:when>
								<xsl:when test="@private">private </xsl:when>
								<xsl:otherwise>public </xsl:otherwise>
							</xsl:choose>

							<xsl:if test="@static">static </xsl:if>

							<xsl:choose>
								<xsl:when test="name() = 'property'">
									<xsl:value-of select="@name" />

									<!-- Output type -->
									<xsl:text> : </xsl:text>
									<xsl:choose>
										<xsl:when test="@type">
											<xsl:call-template name="type_name">
												<xsl:with-param	name="type"><xsl:value-of select="@type" /></xsl:with-param>
											</xsl:call-template>
										</xsl:when>

										<xsl:otherwise>Object</xsl:otherwise>
									</xsl:choose>
								</xsl:when>

								<xsl:when test="name() = 'method'">
									function <xsl:value-of select="@name" /><xsl:call-template name="params" />

									<!-- Output return type -->
									<xsl:if test="not(@constructor)">
										<xsl:text>:</xsl:text>

										<xsl:choose>
											<xsl:when test="return">
												<xsl:choose>
													<xsl:when test="return/@type">
														<xsl:call-template name="type_name">
															<xsl:with-param	name="type"><xsl:value-of select="return/@type" /></xsl:with-param>
														</xsl:call-template>
													</xsl:when>

													<xsl:otherwise>
														<xsl:for-each select="return/type">
															<xsl:call-template name="type_name">
																<xsl:with-param	name="type"><xsl:value-of select="@fullname" /></xsl:with-param>
															</xsl:call-template>

															<xsl:if test="position() != last()">/</xsl:if>
														</xsl:for-each>
													</xsl:otherwise>
												</xsl:choose>
											</xsl:when>

											<xsl:otherwise>void</xsl:otherwise>
										</xsl:choose>
									</xsl:if>
								</xsl:when>

								<xsl:when test="name() = 'option'">
									option <xsl:value-of select="@name" /> : 
									<xsl:call-template name="type_name">
										<xsl:with-param	name="type"><xsl:value-of select="@type" /></xsl:with-param>
									</xsl:call-template>
								</xsl:when>

								<xsl:when test="name() = 'event'">
									event <xsl:value-of select="@name" /><xsl:call-template name="params" />
								</xsl:when>

								<xsl:otherwise><xsl:value-of select="@name" /></xsl:otherwise>
							</xsl:choose>
						</code>

						<xsl:if test="@deprecated">
							<div class="deprecated">
								Deprecated: <xsl:value-of select="@deprecated" />
							</div>
						</xsl:if>

						<div class="memberDescription"><xsl:value-of select="description/text()" disable-output-escaping="yes" /></div>

						<xsl:if test="@version">
							<div class="version">
								<span>Version:</span> <xsl:value-of select="@version" />
							</div>
						</xsl:if>

						<xsl:if test="@author">
							<div class="author">
								<span>Author(s):</span> <xsl:value-of select="@author" />
							</div>
						</xsl:if>

						<!-- Output parameters -->
						<xsl:if test="param">
							<h4>Parameters</h4>

							<table class="params">
								<xsl:for-each select="param">
									<tr>
										<td class="first">
											<xsl:value-of select="@name" />
											<xsl:text>:</xsl:text>

											<xsl:choose>
												<xsl:when test="@type">
													<xsl:call-template name="type_name">
														<xsl:with-param	name="type"><xsl:value-of select="@type" /></xsl:with-param>
													</xsl:call-template>
												</xsl:when>

												<xsl:when test="type">
													<xsl:for-each select="type">
														<xsl:call-template name="type_name">
															<xsl:with-param	name="type"><xsl:value-of select="@fullname" /></xsl:with-param>
														</xsl:call-template>

														<xsl:if test="position() != last()">/</xsl:if>
													</xsl:for-each>
												</xsl:when>

												<xsl:otherwise>Object</xsl:otherwise>
											</xsl:choose>
										</td>
										<td class="last"><xsl:value-of select="description/text()" /></td>
									</tr>
								</xsl:for-each>
							</table>
						</xsl:if>

						<!-- Output return -->
						<xsl:if test="return">
							<h4>Returns</h4>
							<div class="returns">
								<xsl:choose>
									<xsl:when test="return/@type">
										<xsl:call-template name="type_name">
											<xsl:with-param	name="type"><xsl:value-of select="return/@type" /></xsl:with-param>
										</xsl:call-template>
									</xsl:when>

									<xsl:otherwise>
										<xsl:for-each select="return/type">
											<xsl:call-template name="type_name">
												<xsl:with-param	name="type"><xsl:value-of select="@fullname" /></xsl:with-param>
											</xsl:call-template>

											<xsl:if test="position() != last()">/</xsl:if>
										</xsl:for-each>
									</xsl:otherwise>
								</xsl:choose>

								<xsl:text> - <xsl:value-of select="return/description/text()" /></xsl:text>
							</div>
						</xsl:if>

						<!-- Output see also -->
						<xsl:if test="see">
							<h4>See Also</h4>

							<ul class="see">
								<xsl:for-each select="see">
									<xsl:variable name="class" select="@class" />
									<xsl:variable name="member" select="@member" />

									<li>
										<a>
											<xsl:attribute name="href">
												<xsl:choose>
													<xsl:when test="@class">class_<xsl:value-of select="@class" />.html</xsl:when>
													<xsl:otherwise>class_<xsl:value-of select="$target" />.html</xsl:otherwise>
												</xsl:choose>

												<xsl:if test="@member">#<xsl:value-of select="@member" /></xsl:if>
											</xsl:attribute>

											<xsl:text><xsl:value-of select="//class[@fullname=$class]/@name" /></xsl:text>

											<xsl:if test="@member">
												<xsl:if test="@class">.</xsl:if>

												<xsl:choose>
													<xsl:when test="//class[@fullname=$class]/members/method[@name=$member]">
														<xsl:text><xsl:value-of select="$member" />()</xsl:text>
													</xsl:when>

													<xsl:otherwise>
														<xsl:value-of select="$member" />
													</xsl:otherwise>
												</xsl:choose>
											</xsl:if>
										</a>
									</li>
								</xsl:for-each>
							</ul>
						</xsl:if>

						<!-- Output examples -->
						<xsl:if test="example">
							<xsl:for-each select="example">
								<h4>Example</h4>
								<pre class="brush: js;">
									<xsl:value-of select="example/text()" disable-output-escaping="yes" />
								</pre>
							</xsl:for-each>
						</xsl:if>
					</div>
				</xsl:for-each>
			</div>
		</body>
		</html>
	</xsl:template>

	<xsl:template name="params">
		<xsl:text>(</xsl:text>
		<xsl:for-each select="param">
			<xsl:value-of select="@name" />
			<xsl:text>:</xsl:text>

			<xsl:choose>
				<xsl:when test="@type">
					<xsl:call-template name="type_name">
						<xsl:with-param	name="type"><xsl:value-of select="@type" /></xsl:with-param>
					</xsl:call-template>
				</xsl:when>

				<xsl:when test="type">
					<xsl:for-each select="type">
						<xsl:call-template name="type_name">
							<xsl:with-param	name="type"><xsl:value-of select="@fullname" /></xsl:with-param>
						</xsl:call-template>

						<xsl:if test="position() != last()">/</xsl:if>
					</xsl:for-each>
				</xsl:when>

				<xsl:otherwise>Object</xsl:otherwise>
			</xsl:choose>

			<xsl:if test="position() != last()">, </xsl:if>
		</xsl:for-each>
		<xsl:text>)</xsl:text>
	</xsl:template>

	<xsl:template name="type_name">
		<xsl:param name="type" />

		<xsl:choose>
			<xsl:when test="//class[@fullname=$type]">
				<a>
					<xsl:attribute name="href">class_<xsl:value-of select="$type" />.html</xsl:attribute>
					<xsl:value-of select="//class[@fullname=$type]/@name" />
				</a>
			</xsl:when>

			<xsl:otherwise><xsl:value-of select="$type" /></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>