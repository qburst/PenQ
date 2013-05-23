// ==UserScript==
// @name           ClickJacky
// @description	   Detect if a web application/web site is vulnerable to ClickJacking by finding the existence of Anti-Frame Headers such as X-Frame-Options and X-Content-Security
// @author         Aung Khant, YGN Ethical Hacker Group, Yangon, Myanmar, http://yehg.net/
// @namespace      yehg.net
// @include        *
// @exclude        file://
// @exclude        jar://
// @exclude        data://
// @exclude        *.js
// @exclude        *.css
// @exclude        http://*ads*
// @exclude	   about:blank
// ==/UserScript==
var l = unsafeWindow.location.toString();
var htmlBody = (unsafeWindow.document.html==null)?null:unsafeWindow.document.html.innerHTML;
var body = (unsafeWindow.document.body==null)?'null':unsafeWindow.document.body.innerHTML;

if (htmlBody == null)
{
	if (unsafeWindow.top.location == unsafeWindow.location)
	{
		var xhr = new XMLHttpRequest();
		xhr.open("GET",l);
		xhr.setRequestHeader('User-Agent', 'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)');
		xhr.setRequestHeader('Accept', 'text/html');	
		xhr.send(null);
		xhr.onreadystatechange = function() 
		{
			if(xhr.readyState == 4 && xhr.status  == 200) 
			{
				htmlBody = xhr.responseText;
			}
		}
    }
}
var alerts = '';
var policyuri = '';
var policyuri_found = false;
var re_xfo = new RegExp(/DENY|SAMEORIGIN/gi);
var re_xcsp = new RegExp(/frame-ancestors 'none'|frame-ancestors 'self'/gi);
var m_re_xfo = '';
var m_re_xcsp = '';
var xfo = '';
var xcsp = '';
unsafeWindow.find_antiframe_headers = function()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET",l);
	xhr.setRequestHeader('User-Agent', 'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)');
	xhr.setRequestHeader('Accept', 'text/htm');	
    xhr.send(null);
    xhr.onreadystatechange = function() 
	{
		if(xhr.readyState == 2 && xhr.status  == 200) 
		{
			alerts = '';
			xfo = xhr.getResponseHeader("X-Frame-Options"); //@return: null
			if (xfo==null)xfo = 'null';
			xcsp = xhr.getResponseHeader("X-Content-Security-Policy"); //@return: 0
			if (xcsp==null)xcsp = 'null';
			var m_re_xfo = re_xfo.exec(xfo);
			var m_re_xcsp = re_xcsp.exec(xcsp);
	
			if (m_re_xfo == null)
			{
				alerts += "No X-Frame-Options!\n\n"; 
			}
			else
			{
				alerts += "Detected -> X-Frame-Options: " + m_re_xfo + "\n\n"; 
			}
			if (m_re_xcsp == null)
			{
				if (xcsp.indexOf("policy-uri") == -1)
				{	
					alerts += "No Anti-Frame Option in X-Content-Security-Policy!\n\n"; 
				}
				
				if (xcsp!="" && xcsp.indexOf("policy-uri") > -1)
				{	
					policyuri_found = true;
					policyuri = xcsp.replace("policy-uri ","");
					var policyurix = policyuri;
				
					if (policyuri.indexOf("/") == 0)
					{
						policyurix = document.location.protocol + "//" + document.domain + policyuri;
					}
					
					alerts += "Check the policy-uri file ->\n\n" + policyurix  + "\n\nfor frame-ancestors keyword by clicking 'Check XCSP Policy File' button\n\n"; 
					document.getElementById('btn_xcsp_check').style.display = '';

				
				}				
			}
			else
			{
				alerts += "Detected -> X-Content-Security-Policy: " + m_re_xcsp + "\n\n"; 
			}
			alert(alerts);
			
		}
    }
	
	

}
unsafeWindow.check_xcsp_check_policyfile = function(u)
{

	var xhr1 = new XMLHttpRequest();
	xhr1.open("GET",policyuri);
	xhr1.setRequestHeader('User-Agent', 'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)');
	xhr1.setRequestHeader('Accept', 'text/html');	
	xhr1.send(null);
	xhr1.onreadystatechange = function() 
	{
		if(xhr1.readyState == 2 && xhr1.status  == 200) 
		{
			xcsp = xhr1.responseText;
			m_re_xcsp = re_xcsp.exec(xcsp);				
			if (m_re_xcsp != null)
			{
				alerts = 'Detected -> X-Content-Security-Policy: ' + m_re_xcsp + '\n\n'; 
			}
			else
			{
				alerts = "No Anti-Frame Option in X-Content-Security-Policy File!\n\n"; 
			}
		   alert(alerts);			
		}
	}

	
}
unsafeWindow.alertx = function(s)
{
	if(s!='' && s!=null)
		alert(s);
}
unsafeWindow.find_jsbusting = function()
{
   // Credit: OWASP_AppSec_Research_2010_Busting_Frame_Busting_by_Rydstedt.pdf
   var re = new RegExp(/top.location =|top\.location.replace\(top.location\)|top\.location.replace\(self|top\.location.replace\(location|top\.location = self\.location|top\.location\.href = document\.location\.href|top\.location\.href = self\.location\.href|top\.location\.replace\(self\.location\)|top\.location\.href = window\.location\.href|top\.location\.replace\(document\.location\)|top\.location\.href = window\.location\.href|top\.location\.href = "URL"|document\.write\(''\)|top\.location = location|top\.location\.replace\(document\.location\)|top\.location\.replace\('URL'\)|top\.location\.href = document\.location|top\.location\.replace\(window\.location\.href\)|top\.location\.href = location\.href|self\.parent\.location = document\.location|parent\.location\.href = self\.document\.location|top\.location\.href = self\.location|top\.location = window\.location|top\.location\.replace\(window\.location\.pathname\)|window\.top\.location = window\.self\.location|setTimeout\(function\(\)\{document\.body\.innerHTML='';\\},1\);|window\.self\.onload = function\(evt\)\{document\.body\.innerHTML='';\\}|var url = window\.location\.href; top\.location\.replace\(url\)/);
   var m = re.exec(htmlBody);
   if (m != null) 
   {
		alert("FOUND!\n\nFrame Busting Code Match Rule:\n" + m.toString());
   }
   else
   {
		alert("NOT FOUND!\n\nConfirm it again with YEHGCSF!");
   }
}

unsafeWindow.open_yehgcsf = function()
{
	y = 'http://yehg.net/lab/pr0js/pentest/cross_site_framing.php?url=';
	window.open(y+escape(l));
}

/***** [BASE64 ROUTINE] *****/
// Credits: RSnake http://ha.ckers.org/xss.html
unsafeWindow.base64Chars = "";
base64Chars = new Array(
    'A','B','C','D','E','F','G','H',
    'I','J','K','L','M','N','O','P',
    'Q','R','S','T','U','V','W','X',
    'Y','Z','a','b','c','d','e','f',
    'g','h','i','j','k','l','m','n',
    'o','p','q','r','s','t','u','v',
    'w','x','y','z','0','1','2','3',
    '4','5','6','7','8','9','+','/'
);

unsafeWindow.reverseBase64Chars = "";
reverseBase64Chars = new Array();
for (var i=0; i < base64Chars.length; i++){
    reverseBase64Chars[base64Chars[i]] = i;
}

unsafeWindow.base64Str= "";
unsafeWindow.base64Count= "";

unsafeWindow.setBase64Str = "";
setBase64Str = function(str){
    base64Str = str;
    base64Count = 0;
}
unsafeWindow.readBase64 = "";
readBase64 = function() {    
    if (!base64Str) return -1;
    if (base64Count >= base64Str.length) return -1;
    var c = base64Str.charCodeAt(base64Count) & 0xff;
    base64Count++;
    return c;
}

unsafeWindow.readReverseBase64 = function() {   
    if (!base64Str) return -1;
    while (true){      
        if (base64Count >= base64Str.length) return -1;
        var nextCharacter = base64Str.charAt(base64Count);
        base64Count++;
        if (reverseBase64Chars[nextCharacter]){
            return reverseBase64Chars[nextCharacter];
        }
        if (nextCharacter == 'A') return 0;
    } 
}
unsafeWindow.getBase64 = function (field){
    var text = field;

    setBase64Str(text);
    var result = '';
    var inBuffer = new Array(3);
    var lineCount = 0;
    var done = false;
    while (!done && (inBuffer[0] = readBase64()) != -1){
        inBuffer[1] = readBase64();
        inBuffer[2] = readBase64();
        result += (base64Chars[ inBuffer[0] >> 2 ]);
        if (inBuffer[1] != -1){
            result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30) | (inBuffer[1] >> 4) ]);
            if (inBuffer[2] != -1){
                result += (base64Chars [((inBuffer[1] << 2) & 0x3c) | (inBuffer[2] >> 6) ]);
                result += (base64Chars [inBuffer[2] & 0x3F]);
            } else {
                result += (base64Chars [((inBuffer[1] << 2) & 0x3c)]);
                result += ('=');
                done = true;
            }
        } else {
            result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30)]);
            result += ('=');
            result += ('=');
            done = true;
        }
        lineCount += 4;
        if (lineCount >= 76){
            result += ('\n');
            lineCount = 0;
        }
    }
    return result;
    
}
unsafeWindow.toBase64 = "";
toBase64 = function (field){
	
    var text = field;

    setBase64Str(text);
    var result = '';
    var inBuffer = new Array(3);
    var lineCount = 0;
    var done = false;
    while (!done && (inBuffer[0] = readBase64()) != -1){
        inBuffer[1] = readBase64();
        inBuffer[2] = readBase64();
        result += (base64Chars[ inBuffer[0] >> 2 ]);
        if (inBuffer[1] != -1){
            result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30) | (inBuffer[1] >> 4) ]);
            if (inBuffer[2] != -1){
                result += (base64Chars [((inBuffer[1] << 2) & 0x3c) | (inBuffer[2] >> 6) ]);
                result += (base64Chars [inBuffer[2] & 0x3F]);
            } else {
                result += (base64Chars [((inBuffer[1] << 2) & 0x3c)]);
                result += ('=');
                done = true;
            }
        } else {
            result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30)]);
            result += ('=');
            result += ('=');
            done = true;
        }
        lineCount += 4;
        if (lineCount >= 76){
            result += ('\n');
            lineCount = 0;
        }
    }
    return result;
}

unsafeWindow.data_link = "";
data_link = toBase64('<html><head></head><body><iframe width="600" height="300" src="' + l + '"></iframe></body></html>');

unsafeWindow.open_datacsf = function()
{	
    window.open("data:text/html;base64," + data_link);//window.open
}
unsafeWindow.add_btn_cmd = function()
{
	
	var btntxt = "<div style='z-index:10000;position:fixed!important;top:2px;left:40%'>";
	//btntxt += "<input type='button' style='-moz-border-radius: 0.95em 0.95em 0.95em 0.95em;-moz-box-shadow: 0 0 1px rgba(255, 255, 255, 0.1) inset;font:8px;margin:2px;border:1px none;cursor: pointer' value='ClickJacky: JS Framing' onclick='find_jsbusting()' /><br />";
	//button style from https://addons.mozilla.org/
	//btntxt += "<input type='button'  style='-moz-border-radius: 0.95em 0.95em 0.95em 0.95em;-moz-box-shadow: 0 0 1px rgba(255, 255, 255, 0.1) inset;background: -moz-linear-gradient(center top , #77BBFF 40%, #3399FF 60%) repeat scroll 0 0 transparent; border: 1px solid #3D6DB5;  color: #FFFFFF;display: inline-block; font-weight: bold;line-height: 1.538;padding: 0 0.95em; text-shadow: 0 -1px 0 #3D6DB5;margin:4px;border:1px none;cursor: pointer' value='ClickJacky: Open DataCSF' onclick='open_datacsf()' /><br />";
	btntxt += "<input type='button'  style='-moz-border-radius: 0.95em 0.95em 0.95em 0.95em;-moz-box-shadow: 0 0 1px rgba(255, 255, 255, 0.1) inset;background: -moz-linear-gradient(center top , #77BBFF 40%, #3399FF 60%) repeat scroll 0 0 transparent; border: 1px solid #3D6DB5;  color: #FFFFFF;display: inline-block; font-weight: bold;line-height: 1.538;padding: 0 0.95em; text-shadow: 0 -1px 0 #3D6DB5;margin:4px;border:1px none;cursor: pointer' value='ClickJacky: Open YEHGCSF' onclick='open_yehgcsf()' /><br />";
	btntxt += "<input type='button'  style='-moz-border-radius: 0.95em 0.95em 0.95em 0.95em;-moz-box-shadow: 0 0 1px rgba(255, 255, 255, 0.1) inset;background: -moz-linear-gradient(center top , #77BBFF 40%, #3399FF 60%) repeat scroll 0 0 transparent; border: 1px solid #3D6DB5;  color: #FFFFFF;display: inline-block; font-weight: bold;line-height: 1.538; padding: 0 0.95em; text-shadow: 0 -1px 0 #3D6DB5;margin:4px;border:1px none;cursor: pointer' value='ClickJacky: Anti-Frame Headers' onclick='find_antiframe_headers()' /><br />";
	btntxt += "<input type='button' id='btn_xcsp_check' style='-moz-border-radius: 0.95em 0.95em 0.95em 0.95em;-moz-box-shadow: 0 0 1px rgba(255, 255, 255, 0.1) inset;background: -moz-linear-gradient(center top , #77BBFF 40%, #3399FF 60%) repeat scroll 0 0 transparent; border: 1px solid #3D6DB5;  color: #FFFFFF;display: inline-block; font-weight: bold;line-height: 1.538; padding: 0 0.95em; text-shadow: 0 -1px 0 #3D6DB5;margin:4px;border:1px none;cursor: pointer;display:none;' value='ClickJacky: Check XCSP Policy File' onclick='check_xcsp_check_policyfile()' /><br />";
	btntxt += "</div>";
	var nwbody = btntxt + body;
	unsafeWindow.document.body.innerHTML = nwbody;
}

unsafeWindow.add_btn_cmd();


