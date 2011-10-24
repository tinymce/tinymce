<?php
require_once("../config_tinybrowser.php");

header ("Content-type: text/css");
?>
.panel_wrapper div.currentmod {
display:block;
width:100%; 
overflow-x:hidden;
}
form {
margin: 0;
padding: 0;
font-size: 11px;
}
form.custom select, form.custom input {
margin: 0 7px 0 0;
padding: 0;
}
form.custom input {
height: 14px;
padding: 2px 0 0 2px;
}
form.custom select {
margin-top: 1px;
padding: 0;
}
form.custom label {
margin-right: 2px;
}
.del {
margin: 0;
padding: 0;
border: none;
width: 13px !important; /* for IE */ 
height: 13px !important; /* for IE */
vertical-align: middle;
}
.rad {
margin: 0;
padding: 0;
margin-left: 2px !important;
border: none;
background: none;
vertical-align: middle;
}
img {
vertical-align: middle !important;
}
button {
vertical-align: top;
font-size: 11px;
background-color: #d5d5d5;
border: 1px solid #666666;
padding: 1px 2px;
}
*+html button { padding: 0; } /*IE7+ */
* html button { padding: 0; } /*IE6- */
button:hover {
background-color:#8cca83;
cursor: hand;
}
button.edit:hover {
background-color:#ff9999;
}
.tabularwrapper {
margin: 5px;
}
table.browse {
clear: both;
width: 100%;
border: 1px solid #f1f1f1;
border-right: 0;
border-collapse: collapse;
overflow: hidden;
}
table.browse th, table.browse td {
font-size: 10px;
text-align: left;
padding: 0 7px;
color: #0b333c;
border-right: 1px solid #eee;
line-height: 22px;
}
table.browse th {
background-image: url(../img/back.png);
background-repeat: repeat-x;
background-position: bottom left;
border-bottom: 1px solid #b7babc;
}
table.browse th a {
color: #0b333c;
display: block;
width: 100%;
text-decoration: none;
background-repeat: no-repeat;
background-position: center right;
background-image: none;
}
table.browse th a.asc {
background-image: url(../img/asc.gif);
}
table.browse th a.desc {
background-image: url(../img/desc.gif);
}
table.browse tr.r0 td {
	background-color: #FFFFFF;
}
table.browse tr.r1 td {
	background-color: #f5f5f5;
}
table.browse tr.over td, table.browse th.over {
background-color: #b2e1ff;
background-image: none;
}
.img-browser {
margin: 5px;
border: 1px solid #e2e2e2;
float: left;
clear: none;
text-align: center;
height: <?php echo $tinybrowser['thumbsize']+40; ?>px;
width: <?php echo $tinybrowser['thumbsize']+25; ?>px;
font-size: <?php echo $tinybrowser['thumbsize']; ?>px;
}
*+html .img-browser { width: <?php echo $tinybrowser['thumbsize']+28; ?>px; } /*IE7+ */
* html .img-browser { width: <?php echo $tinybrowser['thumbsize']+28; ?>px; } /*IE6- */
.img-browser img {
border: 0;
vertical-align: middle;
margin-top: -20px;
}
*+html .img-browser img { margin-top: 0; } /*IE7+ */
* html .img-browser img { margin-top: 0; } /*IE6- */
.img-browser a {
display: block;
width: 100%;
height: 100%;
text-decoration: none;
}
.img-browser a:hover {
background-color: #b2e1ff;
}
.filename {
font-family: Tahoma,Arial,Helvetica,sans-serif;
clear:both;
font-size: 11px;
line-height: 13px;
overflow: hidden;
width: <?php echo $tinybrowser['thumbsize']+20; ?>px;
height: 28px;
margin-top: -6px;
padding-left: 3px;
}
a.imghover {
padding-left: 22px;
display: block;
position: relative; 
z-index: 30;
background-image: url(../img/preview.gif);
background-repeat: no-repeat;
background-position: 0 4px;
}
a.imghover img {
position: absolute; 
z-index: 31; 
background-color: #fff;
padding: 4px;
border: 1px solid #888888;
display: none; 
}
a.imghover:hover img {
top: -5px; 
left: 140px; 
display: block;
}
.pushleft {
padding: 4px 5px;
float: left;
text-align: left;
}
.pushright {
padding: 4px 5px;
float: right;
text-align: right;
}
a {
outline: none;
border: 0;
}
.alertsuccess, .alertfailure, .alertinfo {
position: relative;
clear: both;
margin: 0 auto;
padding: 4px 4px 4px 4px;
width: 98%;
text-align: center;
border-style: solid;
border-width: 1px;
}
.alertsuccess {
border-color: #00C000;
background-color: #BBFFBB;
}
.alertfailure {
border-color: #CC0000;
background-color: #FFBBBB;
}
.alertinfo {
border-color: #1133DD;
background-color: #AACCFF;
}
