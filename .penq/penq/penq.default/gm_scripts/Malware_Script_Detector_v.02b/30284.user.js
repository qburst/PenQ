// ==UserScript==
// @name           Malware Script Detector v.02b
// @namespace      http://yehg.net
// @author		 d0ubl3_h3lix <http://yehg.net>
// @description    Detect and Alert Malicious JavaScript : XSSProxy, XSS-Shell, AttackAPI, Beef. But No guarantee for full prevention of XSS-Injection threats. Many ways to bypass it but I'm sure it protects you from casual attackers.The main objective of developing Malware Script Detector is that I'm afraid of XSSProxy, XSS-Shell, AttackAPI, Beef and I want to detect them. Malicious sites intentionally embed them. Firefox XSS Warning addon can't check this. This new version is supposed to protect you from most XSS attacks.
// @include     *
// @exclude		
// ==/UserScript==


/***** [Function Lib] ******/	

function deny(worm,xss)
{
	var msg = "STOP VISITING THIS PAGE?\n\n";
	if (worm)
	{
		msg += "Warning:\n\nThis site may have malicious scripts hosted or injected by malicious guys!\n\nSolution: Disable JavaScript\n\nDetected Malware: " + worm;	
	}
	else 
	{
		msg += "Warning::\n\nXSS Attack Detected!\n\nURI:\n" + escape(xss);
	}
	msg += "\n\n----------------------------------\nMalware Script Detector v2\nby d0ubl3_h3lix\nhttp://yehg.net";
	if(confirm(msg))
	{
		
		window.location.replace('javascript:document.write("<div style=\'color:#666666;\'><h1>You have been protected by Malware Script Detector v2!<\/h1><h4>Coded by d0ubl3_h3lix, <a href=\'http:\/\/yehg.net\' style=\'text-decoration:none;\'>http:\/\/yehg.net<\/a><br>YGN Ethical | Hacker Group<br>Yangon, Myanmar<\/h4><\/div>");');
		setTimeout("window.location.replace(\"about:blank\");",1000);
	}
	
}

/***** [/Function Lib] ******/

// AttackAPI uses AttackAPI object
if(unsafeWindow.AttackAPI)
{
	unsafeWindow.AttackAPI = null;
	deny("AttackAPI");
}

// BeEF uses beef_onload function
if(unsafeWindow.beef_onload)
{
	unsafeWindow.beef_onload = function(){};
	unsafeWindow.beef_url = '';
	unsafeWindow.return_result = function(){};
	unsafeWindow.include = function(){};
    unsafeWindow.key_history = null;
	unsafeWindow.magic_seq = null;
	unsafeWindow.catch_key = null;
	deny("BeEF");
}
if ( typeof(return_result)== "function" && typeof(include)== "function" && typeof(save_page)== "function" )
{
	deny("BeEF");
}
if  ( (/(BeEFSession|hook\/return\.php\?BeEFSesion|hook\/autorun\.js\.php\?BeEFSession|hook\/command\.php\?BeEFSession|hook\/return\.php\?BeEFSession).*/i).test(document.location) )
{
	deny("BeEF");
}
// Let's scan the script contents

for (var i=0;i<=document.getElementsByTagName("script").length-1;i++)
{
	if  ((/(BeEFSession|hook\/return\.php\?BeEFSesion|hook\/autorun\.js\.php\?BeEFSession|hook\/command\.php\?BeEFSession|hook\/return\.php\?BeEFSession).*/i).test(document.getElementsByTagName("script")[i].innerHTML) )
	{ 
		deny("BeEF");
	}
	if  ((/(chrome:\/\/).*/i).test(document.getElementsByTagName("script")[i].innerHTML) )
	{ 
		deny("Firefox Exploiter via chrome: protocol");
	}	
}

// This will detect XSS-Shell
// Left lots of function to avoid false alarms
// Below are suspicious functions even if target web sites don't use malware scripts
if ( (unsafeWindow.attachKeylogger) || (unsafeWindow.cmdDoS) || (unsafeWindow.cmdCrash) || (unsafeWindow.getInternalIP) || (unsafeWindow.getClipboard))
{
	unsafeWindow.attachKeylogger = function(){};
	unsafeWindow.cmdDoS = function(){};
	unsafeWindow.cmdCrash= function(){};
	unsafeWindow.getInternalIP= function(){};
	unsafeWindow.getClipboard= function(){};
	unsafeWindow.logMouse= function(){};
	deny("XSS-Shell");
	
}

// Let's detect XSS-Proxy
// Problem: XSS-Proxy uses innocent function names 
// So, we need to look inside their functions for effective detection
// May cause false alerts

if (unsafeWindow.showDoc)
{
	var ishowDoc = unsafeWindow.showDoc + '';
	if((/(nodesLen|snd0Back|sendBack|serverLen).*/i).test(ishowDoc))
	{
		deny("XSS-Proxy");		
	}	
	
}else if (unsafeWindow.scriptRequest)
{
	var iscriptRequest = unsafeWindow.scriptRequest + '';
	if((/(parms|scriptTag).*/i).test(iscriptRequest) && (unsafeWindow.onerror==unsafeWindow.reportError))
	{
		deny("XSS-Proxy");
	}		
}



// Next we search for 'xss' keyword in script src

var scr = document.getElementsByTagName("script");
if(scr.length>=1)
{

		for(var i=0;i<=scr.length-1;i++)
		{
			if (document.getElementsByTagName("script")[i].src != '')
			{
			      var src = document.getElementsByTagName("script")[i].src; 
				if((/(xss2\.js|xss1\.js|xss\.js|xss\-proxy|xssproxy|XSS\-Proxy[\s\S\w\W]*\.pl).*/i).test(src))
				{
				    deny("XSS-Proxy\n\nSource:" + src);
				}
				else if((/(xssshell|xss\-shell|xss_shell).*/i).test(src))					
				{
				    deny("XSS-Shell\n\nSource:" + src);						
				}				
				else if((/(beef\.js|beefmagic\.js).*/i).test(src))				
				{
				    deny("BeEF\n\nSource:" + src);

				}				
				else if((/(attackapi|attackapi\-standalone).*/i).test(src))
				{
				    deny("AttackAPI\n\nSource:" + src);

				}								
				else if ((src.indexOf("xss") > 0) || (src.indexOf("evilscript") > 0))
				{
				    deny("Customized XSS Malware\n\nSource:" + src);						
				}
			}
		}

}



/*
*  @credit:  Codes below based on Firefox XSS Warning Addon by Gianni Amato
*  @thankz: mario, secg33k, w3af author for encouragements & suggestions
*  @warning: This filtering may cause false negative signs to user
*  @modified: Integrate much more smart attack vectors which defeat XSS Warning Addon black list
*  @reference: XSS Attacks & Defenses by PDP, RSnake, Jeremiah, Aton, Fogie, Syngress Publishing, ISBN-13:987-1-59749-154-9
*  
*  Simple Defeating XSS Addon Filter With Hex Coding:
*  http://yehg.org/?xss=&#x22;&#x3e;&#x3c;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3e;&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x30;&#x29;
*
*  @added:
*
*  data: protocol exploitation like 
*  							data:image/gif;
*  							data:text/javascript;
*  jar: protocol exploitation
*  unicode encoded injection
*  utf-7,null-byte, comments star slash injection (/* *), injection like \u00, \x00....etc
*  
*  [note: &# is subset to various encodings , see &#x9,&#x0000009, &#60,&#060] 
*  
*  guh! It helps protect XSS a little though.
*/


var blacklist = /(%00|\\00|\\x00|\\u00|%5C00|&#|&#x|%09|%0D%0A|&#10;|<|%3C|%BC|&#60;|&#x3c;|%uff1c|\+ADw\-|>|%3E|%BE|&#62;|&#x3e;|\+AD4\-|%uff1e|(jar|data|file|keyword|telnet|aim|call|res|x\-gadget|about|livescript|mocha|vbscript)(:|%3A)|(xssed|xssing|xss|mozxss|scriptlet)\.js|(eval|seekSegmentTime|FSCommand)\(|(=|%3D)document;|unescape|\.source|\.hash|\.cookie|\.innerHTML|on(abort|activate|afterprint|afterupdate|beforeupdate|beforeactivate|beforecopy|beforecut|beforedeactivate|beforeeditfocus|beforepaste|beforeprint|beforeunload|begin|blur|bounce|cellchanged|change|click|contextmenu|controlselect|copy|cut|dataavailable|datasetchanged|datasetcomplete|dblclick|deactivate|drag|dragend|dragleave|dragenter|dragover|dragdrop|drop|end|error|errorupdate|exit|filterchange|finish|focus|focusin|focusout|help|keydown|keypress|keyup|layoutcomplete|load|losecapture|mediacomplete|mediaerror|mousedown|mouseenter|mouseleave|mousemove|mouseout|mouseover|mouseup|mousewheel|move|moveend|movestart|outofsync|paste|pause|progress|propertychange|readystatechanged|repeat|reset|resize|resizeend|resizestart|resume|reverse|rowenter|rowexit|rowdelete|rowinserted|scroll|seek|select|selectionchanged|selectstart|start|stop|synchrestored|submit|timeerror|trackchanged|unload|urlflip)(=|%3D)|[a-z]*(=|%3D)[a-z]*(:|%3A|=|%3D)[a-z]*;|xmlhttprequest()|background(=|%3D|:|%3A|\-image:|\-image%3A|\-color:|\-color%3A)|(url|binding|expression|behavior)(:|%3A|%28)|(jav%20ascript|javascript)(:%3A)|ja(\\|%5C)vasc(\\|%5C)ript*|java[\s\S\w\W]*scr|java[\s\S\w\W]*ipt|document\.|String\.fromCharCode|(\/|%2F)\**\*(\/|%2F)*|(\\|%5C)[a-z]*|%5C\d{1,10}|%5C(x|u)\d{1,10}|(\));\/\/|\'\;|"\;|\'%3B|"%3B|%27%3B|%22%3B|%27\;|%22\;|\,62).*/i;



var excludes =/(^http\:\/\/suggestqueries.google.com|^http\:\/\/toolbarqueries.google.|.intellitxt.com|pagead2.googlesyndication.com|google-analytics.com|.tradedoubler.com|mybloglog.com|.revsci.net|.shinystat.com|^http\:\/\/www.frappr.com|^http\:\/\/secure-it.imrworldwide.com|^http\:\/\/ciaoshopit.122.2o7.net|^http\:\/\/67.19.32.210|^http\:\/\/67.19.226.194|^http\:\/\/www.banneradmin.rai.it|^http\:\/\/disqus.com|^http\:\/\/adv.alice.it|^http\:\/\/www.ilsole24ore.com\/s24service|^http\:\/\/www.anobii.com\/anobi\/badge_generator|^http\:\/\/shots.snap.com\/marea.js|^http\:\/\/ads2.exhedra.com|^http\:\/\/www.film.it).*/;

// Get QueryString
var URL = document.location+'';
var URI = URL.substring(URL.indexOf("?")+1,URL.length);

if (URL!=URI) 
{
	if( (!excludes.test(document.domain)) && (blacklist.test(URI)))
	{
		deny(null,URI);
	}
	
}
	
