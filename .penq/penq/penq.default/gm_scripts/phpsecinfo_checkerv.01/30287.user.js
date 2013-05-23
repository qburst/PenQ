// ==UserScript==
// @name           phpsecinfo_checkerv.01
// @namespace      yehg.net
// @author		   Aung Khant
// @description    Check phpinfo page for security and performance issues. Greasemonkey Implementation of  phpsecinfo(); from http://phpsecinfo.com. Modified a little bit. pAdded PHP Manual Notes. This may be incomplete. Send bugs and suggestions via contact form at http://yehg.net 
// @ref			   http://www.linuxformat.co.uk/wiki/index.php/PHP_-_Secure_coding
// @include        *
// ==/UserScript==

var version = "0.1";
var author = "Aung Khant (http://yehg.net/lab)";
var yehg_url = "http://yehg.net";

function get_more_info_url(path)
{
	return " &#8212;&nbsp;&nbsp;<a style=\"-moz-border-radius-bottomleft:5px;-moz-border-radius-bottomright:5px;-moz-border-radius-topleft:5px;-moz-border-radius-topright:5px;text-decoration:none;\" href=\"http://phpsec.org/projects/phpsecinfo/tests/" + path + ".html\" target=\"_blank\">&nbsp;&nbsp;More Info &raquo;&nbsp;</a><br /><br />";
}

if(document.title.search(/(phpinfo\(\))/i)==0)
{

var body = document.body.innerHTML;
unsafeWindow.warnings = "";
unsafeWindow.criticals = 0;
unsafeWindow.no = 0;

check = /(System <\/td><td class="v">)+(\w+)+(\s\S+)/gi;
check.exec(body);
unsafeWindow.system = RegExp.$2 + " " + RegExp.$3;
unsafeWindow.isWinSys = (unsafeWindow.system.match(/Window/gi)!=null)?true:false;
unsafeWindow.warnings = "<h3>System: " + unsafeWindow.system + "</h3>";


/*************[SECURE SETTINGS]*************/

////////// [CORE] ////////////////	

// allow_url_fopen	
unsafeWindow.allow_url_fopen = "Off";
unsafeWindow.allow_url_fopen_warning = "allow_url_fopen is enabled</h3>allow_url_fopen is enabled.  This could be a serious security risk.  You should disable allow_url_fopen and consider using the PHP cURL functions, http://php.net/manual/en/ref.curl.php instead.";

	
unsafeWindow.allow_url_fopen_check = function()
{
	check = /(allow_url_fopen<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);
	if(RegExp.$2 != unsafeWindow.allow_url_fopen && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.allow_url_fopen_warning + get_more_info_url("allow_url_fopen");
		unsafeWindow.criticals++;	
	}	
}

// allow_url_include
unsafeWindow.allow_url_include = "Off";
unsafeWindow.allow_url_include_warning = "allow_url_include is enabled</h3>allow_url_include is enabled.  This could be a serious security risk.  You should disable allow_url_include and consider using the PHP cURL functions, http://php.net/manual/en/ref.curl.php instead.";

unsafeWindow.allow_url_include_check = function()
{
	check = /(allow_url_include<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);
	if(RegExp.$2 != unsafeWindow.allow_url_include && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.allow_url_include_warning+ get_more_info_url("allow_url_include");	
		unsafeWindow.criticals++;
	}	
}

// display_errors
unsafeWindow.display_errors = "Off";
unsafeWindow.display_errors_warning = "display_errors is enabled</h3>display_errors is enabled.  This is not recommended on \"production\" servers, as it could reveal sensitive information.  You should consider disabling this feature. Developers may not remember to set error_repoting(0) in their PHP scripts for always.";

unsafeWindow.display_errors_check = function()
{
	check = /(display_errors<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);
	if(RegExp.$2 != unsafeWindow.display_errors && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.display_errors_warning + get_more_info_url("display_errors");
		unsafeWindow.criticals++;	
	}	
}

// expose_php
unsafeWindow.expose_php = "Off";
unsafeWindow.expose_php_warning = "expose_php is enabled</h3>This adds the PHP \"signature\" to the web server header, including the PHP version number.  This	could attract attackers looking for vulnerable versions of PHP.";

unsafeWindow.expose_php_check=function()
{
	check = /(expose_php<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);
	if(RegExp.$2 != unsafeWindow.expose_php && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.expose_php_warning + get_more_info_url("expose_php");	
		unsafeWindow.criticals++;
	}	
}


// file_uploads
unsafeWindow.file_uploads = "Off";
unsafeWindow.file_uploads_warning = "file_uploads is enabled</h3>If you do not require file upload capability, consider disabling them.";

unsafeWindow.file_uploads_check=function()
{
	check = /(file_uploads<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);	
	if(RegExp.$2 != unsafeWindow.file_uploads && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:#FFA500'>"+ unsafeWindow.no + ") " + unsafeWindow.file_uploads_warning + get_more_info_url("file_uploads");	
	}	
}


// lowest_privilege_test
unsafeWindow.lowest_privilege_test = 99;
unsafeWindow.lowest_privilege_test_warning = "lowest privilege test fails</h3>PHP may be executing as a `privileged` group, which could be a serious security vulnerability. Search for User/Group.";

unsafeWindow.lowest_privilege_test_check=function()
{
	check = /(User\/Group <\/td><td class="v">)+(\w+\()+(\d+)+(\))/gi;
	check.exec(body);	
	if(RegExp.$3 < unsafeWindow.lowest_privilege_test)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.lowest_privilege_test_warning + get_more_info_url("user_id");
		unsafeWindow.criticals++;	
	}	
}


// magic_quotes_gpc
unsafeWindow.magic_quotes_gpc = "Off";
unsafeWindow.magic_quotes_gpc_warning = "magic_quotes_gpc is enabled</h3>This feature is inconsistent in blocking attacks, and can in some cases cause data loss with uploaded files.  You should <i>not</i> rely on magic_quotes_gpc to block attacks.  It is recommended that magic_quotes_gpc be disabled, and input filtering be handled by your PHP scripts.";

unsafeWindow.magic_quotes_gpc_check=function()
{
	check = /(magic_quotes_gpc<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);	
	if(RegExp.$2 != unsafeWindow.magic_quotes_gpc && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:#FFA500'>"+ unsafeWindow.no + ") " + unsafeWindow.magic_quotes_gpc_warning + get_more_info_url("magic_quotes_gpc");	
	}	
}

// memory_limit
unsafeWindow.memory_limit = 10;
unsafeWindow.memory_limit_alert_warning = "memory_limit is set to a very high value</h3>Are you sure your apps require this much memory? If not, lower the limit, as certain attacks or poor programming practices can lead to exhaustion of server resources. It is recommended that you set this to a realistic value (8M for example) from which it can be expanded as required. memory_limit also affects file uploading. Generally speaking, memory_limit should be larger than post_max_size. ";
unsafeWindow.memory_limit_notice_warning = "memory_limit does not appear to be enabled</h3> This leaves the server vulnerable to attacks that attempt to exhaust resources and creates an environment where poor programming practices can propagate unchecked.  This must be enabled at compile time by including the parameter \"--enable-memory-limit\" in the configure line.  Once enabled \"memory_limit\" may be set in php.ini to define the maximum amount of memory a script is allowed to allocate.memory_limit also affects file uploading. Generally speaking, memory_limit should be larger than post_max_size.";

unsafeWindow.memory_limit_check=function()
{
	check = /(memory_limit<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);	
	var mem = Number(RegExp.$2.replace("M",""));
	if(mem.toString().match(/[0-9]+/g)==null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.memory_limit_notice_warning + get_more_info_url("memory_limit");
		unsafeWindow.criticals++;
	}
	else if(mem > unsafeWindow.memory_limit && mem != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.memory_limit_alert_warning + get_more_info_url("memory_limit");
		unsafeWindow.criticals++;			
	}		

}


// open_basedir
unsafeWindow.open_basedir_alert_warning = "open_basedir is disabled</h3>You should consider turning this on. When this is enabled, only files that are in the given directory/directories and their subdirectories can be read by PHP scripts.  Keep in mind that other web applications not written in PHP will not be restricted by this setting.";

unsafeWindow.open_basedir_notice_warning = "open_basedir is enabled</h3> This is the recommended setting but do KEEP in mind that other web applications not written in PHP will not be restricted by this setting.";

unsafeWindow.open_basedirs = "";

unsafeWindow.open_basedirs_strength = true;
unsafeWindow.open_basedirs_wrongs = "";

unsafeWindow.open_basedir_check=function()
{
	check = /(open_basedir<\/td><td class="v">)+([\S\w]+)/gi;
	check.exec(body);
	unsafeWindow.open_basedirs = RegExp.$2;	
	if(RegExp.$2.toString().match(/(\/|\\)/g) == null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.open_basedir_alert_warning + get_more_info_url("open_basedir");
		unsafeWindow.criticals++;
	}	
	else  
	{	
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:yellowgreen'>"+ unsafeWindow.no + ") " + unsafeWindow.open_basedir_notice_warning + get_more_info_url("open_basedir");
		
		unsafeWindow.open_basedirs = unsafeWindow.open_basedirs.replace("</td><td","");		
		unsafeWindow.open_basedirs_array = unsafeWindow.open_basedirs.split(":");
		
		for(var d=0;d<=unsafeWindow.open_basedirs_array.length-1;d++)
		{
			var ck = unsafeWindow.open_basedirs_array[d].lastIndexOf("/")+1; 
			if(ck!=unsafeWindow.open_basedirs_array[d].length)
			{
				unsafeWindow.open_basedirs_strength = false;
				unsafeWindow.open_basedirs_wrongs += "<br/> &raquo;<span style=\"color:red;font-weight:bold\">" + 
						unsafeWindow.open_basedirs_array[d] + 
						"</span>  will allow files to loaded from <span style=\"color:red;font-weight:bold\">" +
						unsafeWindow.open_basedirs_array[d] + "_evil</span>";
			}
		}
		if (!unsafeWindow.open_basedirs_strength)
		{
			unsafeWindow.warnings += "<h3 style='color:red'>Open_BaseDir FAILS!</h3> Though open_basedir is enabled, insecure restrictions have been made. Be sure to add final slash / to each directory. eg. /tmp =&gt; /tmp/<br />E.g." + unsafeWindow.open_basedirs_wrongs; 
		}
			
	}
}


// post_max_size
unsafeWindow.post_max_size = 8;
unsafeWindow.post_max_size_alert_warning = "post_max_size is set to a very high value</h3>Larger value can lead to exhaustion of server resources. It is recommended that you set this to a realistic value (8M for example) from which it can be expanded as required.If memory limit is enabled by your configure script, memory_limit also affects file uploading. Generally speaking, memory_limit should be larger than post_max_size. ";
unsafeWindow.post_max_size_notice_warning = "post_max_size does not appear to be enabled</h3> This leaves the server vulnerable to attacks that attempt to exhaust resources.";

unsafeWindow.post_max_size_check=function()
{
	check = /(post_max_size<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);	
	var post_size = Number(RegExp.$2.replace("M",""));	
	if(post_size.toString().match(/[0-9]+/g)==null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.post_max_size_notice_warning + get_more_info_url("post_max_size");
		unsafeWindow.criticals++;
	}
	else if(post_size > unsafeWindow.post_max_size && post_size != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.post_max_size_alert_warning + get_more_info_url("post_max_size");	
		unsafeWindow.criticals++;		
	}
}


// register_globals
unsafeWindow.register_globals = "Off";
unsafeWindow.register_globals_warning = "register_globals is enabled</h3>This feature is inconsistent in blocking attacks, and can in some cases cause data loss with uploaded files.  You should <i>not</i> rely on register_globals to block attacks.  It is recommended that register_globals be disabled, and input filtering be handled by your PHP scripts.";

unsafeWindow.register_globals_check=function()
{
	check = /(register_globals<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);	
	if(RegExp.$2 != unsafeWindow.register_globals && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.register_globals_warning + get_more_info_url("register_globals");	
		unsafeWindow.criticals++;
	}	
}

// upload_max_filesize
unsafeWindow.upload_max_filesize = 8;
unsafeWindow.upload_max_filesize_alert_warning = "upload_max_filesize is set to a very high value</h3>Are you sure your apps require uploading files of this size?  If not, lower the limit, as large file uploads can impact server performance.";

unsafeWindow.upload_max_filesize_check=function()
{
	check = /(upload_max_filesize<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);	
	var mem = Number(RegExp.$2.replace("M",""));
	if(mem > unsafeWindow.upload_max_filesize && mem != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:#FFA500'>"+ unsafeWindow.no + ") " + unsafeWindow.upload_max_filesize_alert_warning + get_more_info_url("upload_max_filesize");			
	}		

}

// upload_tmp_dir
unsafeWindow.upload_tmp_dir_alert_warning = "upload_tmp_dir is world-accessible directory</h3>This typically allows other users on this server to access temporary copies of files uploaded via your PHP scripts.  You should set upload_tmp_dir to a non-world-readable directory.";

unsafeWindow.upload_tmp_dir_notice_warning = "upload_tmp_dir is enabled</h3> This is the recommended setting. Make sure your upload_tmp_dir path is not world-readable.";

unsafeWindow.upload_tmp_dir_check=function()
{
	check = /(upload_tmp_dir<\/td><td class="v">)+([\S\w]+)/gi;
	check.exec(body);
		
	if(RegExp.$2.toString().match(/(\/|\\)/g) == null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.upload_tmp_dir_alert_warning + get_more_info_url("upload_tmp_dir");
		unsafeWindow.criticals++;
	}	
	else  
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:yellowgreen'>"+ unsafeWindow.no + ") " + unsafeWindow.upload_tmp_dir_notice_warning + get_more_info_url("upload_tmp_dir");
	}
}




////////// [/CORE] ////////////////

////////// [CGI] ////////////////

// cgi.force_redirect
unsafeWindow.cgi_force_redirect = "On";
unsafeWindow.cgi_force_redirect_warning = "CGI::force_redirect is disabled</h3>In most cases, this is a <strong>serious</strong> security vulnerability.  Unless you are absolutely sure this is not needed, enable this setting.cgi.force_redirect is necessary to provide security running PHP as a CGI under most web servers. Left undefined, PHP turns this on by default. ";

unsafeWindow.cgi_force_redirect_check=function()
{
	check = /(cgi\.force_redirect<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);
	if(RegExp.$2 != unsafeWindow.cgi_force_redirect && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.cgi_force_redirect_warning + get_more_info_url("force_redirect");
		unsafeWindow.criticals++;	
	}	
}

////////// [/CGI] ////////////////
////////// [CURL] ////////////////

// curl_file_support
unsafeWindow.curl_file_support_alert = "cURL::file_support has not been fixed</h3>A security hole present in your version of PHP allows the cURL functions to bypass safe_mode and open_basedir restrictions.  You should upgrade to the latest version of PHP.";

unsafeWindow.curl_file_support_notice = "cURL::file_support has been fixed</h3>You are running PHP 4.4.4 or higher, or PHP 5.1.6 or higher.  These versions fix the security hole present in the cURL functions that allow it to bypass safe_mode and open_basedir restrictions.";

unsafeWindow.curl_file_support_check=function()
{
	check = /(<h1 class="p">PHP Version).(\d).(\d).(\d)<\/h1>/gi;
	check.exec(body);
	var curver = Number(RegExp.$2 + "."+ RegExp.$3 + RegExp.$4);	
	var v4check = 4.44; // I concat , real is 4.4.4
	var v5check = 5.16;
	var v6check = 6;
	var ok = false;
	
	if(RegExp.$2 == 4){if(curver >= v4check)ok=true;}
	else if(RegExp.$2 == 5){if(curver >= v5check)ok=true;}
	else if(RegExp.$2 == v6check){ok=true;}
	if(ok==true)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:yellowgreen'>"+ unsafeWindow.no + ") " + unsafeWindow.curl_file_support_notice + get_more_info_url("file_support");	
	}	
	else 
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.curl_file_support_alert + get_more_info_url("file_support");
		unsafeWindow.criticals++;			
	}
}


////////// [/CURL] ////////////////
////////// [SESSION] ////////////////

// session.save_path
unsafeWindow.session_save_path = /(\/|\\)/g;
unsafeWindow.session_save_path_alert_warning = "Session::save_path is world-accessible directory</h3>This typically allows other users on this server to access session files. You should set save_path to a non-world-readable directory.";

unsafeWindow.session_save_path_notice_warning = "Session::save_path is enabled</h3> This is the recommended setting. Make sure your session_save_path path is not world-readable.";

unsafeWindow.session_save_path_check =function()
{
	check = /(session\.save_path<\/td><td class="v">)+([\S\w]+)/gi;
	check.exec(body);
	//alert(RegExp.$2);
	if(RegExp.$2.toString().match(/(\/|\\)/g) == null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.session_save_path_alert_warning + get_more_info_url("save_path");
		unsafeWindow.criticals++;
	}	
	else  
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:yellowgreen'>"+ unsafeWindow.no + ") " + unsafeWindow.session_save_path_notice_warning + get_more_info_url("save_path");
	}
}

// use_trans_sid

unsafeWindow.session_use_trans_sid_warning = "use_trans_sid is enabled</h3>This makes session hijacking easier.  Consider disabling this feature. URL based session management has additional security risks compared to cookie based session management. Users may send a URL that contains an active session ID to their friends by email or users may save a URL that contains a session ID to their bookmarks and access your site with the same session ID always, for example. ";

unsafeWindow.session_use_trans_sid_check=function()
{
	check = /(session\.use_trans_sid<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);
	//alert(RegExp.$2);
	if(RegExp.$2.toString().match(/(Off|0)+/gi)==null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.session_use_trans_sid_warning + get_more_info_url("use_trans_sid");
		unsafeWindow.criticals++;	
	}	
}

////////// [/SESSION] ////////////////

////////// [My] ////////////////


// default_charset

unsafeWindow.default_charset_warning = "default_charset is set to none</h3>This makes PHP scripts vulnerable to variable charset encoding XSS. This should be utf-8 by default. ";

unsafeWindow.default_charset_check=function()
{
	check = /(default_charset<\/td><td class="v">)+([\S\w]+)/gi;
	check.exec(body);
	//alert(RegExp.$2);
	if(RegExp.$2.toString().match(/(no|0)+/gi)!=null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.default_charset_warning ;	
		unsafeWindow.criticals++;
	}	
}


// disable_functions

unsafeWindow.disable_functions_warning = "disable_functions is set to few</h3>This makes third-party backdoor components can call some executable functions. <br>Disable at least - exec,dl,passthru,shell_exec,system,popen .<br>Complete lists are exec,passthru,popen,pclose,proc_close,proc_get_status,proc_nice,proc_open,proc_terminate,<br>shell_exec,system,link,dl,apc_clear_cache,apc_store,apc_fetch,apc_delete,apc_define_constants,<br>apc_load_constants,apc_compile_file.";

unsafeWindow.disable_functions_alert = "disable_functions is set to none</h3>This makes third-party backdoor component can call all executable functions. <br>Disable at least - exec,dl,passthru,shell_exec,system,popen .<br>Complete lists are exec,passthru,popen,pclose,proc_close,proc_get_status,proc_nice,proc_open,proc_terminate,<br>shell_exec,system,link,dl,apc_clear_cache,apc_store,apc_fetch,apc_delete,apc_define_constants,<br>apc_load_constants,apc_compile_file.";


unsafeWindow.disable_functions_check=function()
{
	check = /(disable_functions<\/td><td class="v">)+([\S\w]+)/gi;
	check.exec(body);
	//alert(RegExp.$2);
	var pat = /\s*,\s*/;
	disfuncs =RegExp.$2.toString().split(pat);
	if(disfuncs.length < 5)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.disable_functions_warning ;			
		unsafeWindow.criticals++;
	} 	
	else if(RegExp.$2.toString().match(/(no|0)+/gi)!=null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.disable_functions_alert ;	
		unsafeWindow.criticals++;
	}	
}

// enable_dl
unsafeWindow.enable_dl = "Off";
unsafeWindow.enable_dl_warning = "enable_dl function is enabled</h3>Disable this feature. The main reason for turning dynamic loading off is security. With dynamic loading, it's possible to ignore all open_basedir restrictions. The default is to allow dynamic loading, except when using safe mode.";

unsafeWindow.enable_dl_check=function()
{
	check = /(enable_dl<\/td><td class="v">)+(\w+)/gi;
	check.exec(body);
	if(RegExp.$2 != unsafeWindow.enable_dl && RegExp.$2 != "")
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.enable_dl_warning;
		unsafeWindow.criticals++;	
	}	
}

// session.hash_function
unsafeWindow.session_hash_function_warning = "Session::hash_function</h3> If your server hosts mission critical applications, use secure hash like SHA-512 as of this writing.";

unsafeWindow.session_hash_function_check =function()
{
	check = /(session\.hash_function<\/td><td class="v">)+(\w\S+)/gi;
	check.exec(body);
	//alert(RegExp.$2);
	if(RegExp.$2.toString().match(/(no|md5|0)/gi)!=null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:#FFA500'>"+ unsafeWindow.no + ") " + unsafeWindow.session_hash_function_warning ;	
	}	
}


// session.cookie_httponly
unsafeWindow.session_cookie_httponly_warning = "Session::cookie_httponly is disabled</h3> Nowadays, all modern web browsers support httponly for cookie. Enable it to prevent XSS attacks.";

unsafeWindow.session_cookie_httponly_check =function()
{
	check = /(session\.cookie_httponly<\/td><td class="v">)+(\w\S+)/gi;
	check.exec(body);
	//alert(RegExp.$2);
	if(RegExp.$2.toString().match(/off|no|0/gi)!=null)
	{
		unsafeWindow.no++;
		unsafeWindow.warnings += "<h3 style='color:red'>"+ unsafeWindow.no + ") " + unsafeWindow.session_cookie_httponly_warning  ;	
		unsafeWindow.criticals++;
	}	
}

////////// [/My] ////////////////

if (unsafeWindow.isWinSys)
{
	checks = ["allow_url_fopen","allow_url_include","display_errors","file_uploads","expose_php","magic_quotes_gpc","memory_limit","open_basedir","post_max_size","register_globals","upload_max_filesize","cgi_force_redirect","curl_file_support","session_use_trans_sid","default_charset","disable_functions","enable_dl","session_hash_function","session_cookie_httponly"];	
}
else
{
	checks = ["allow_url_fopen","allow_url_include","display_errors","file_uploads","expose_php","lowest_privilege_test","magic_quotes_gpc","memory_limit","open_basedir","post_max_size","register_globals","upload_max_filesize","upload_tmp_dir","cgi_force_redirect","curl_file_support","session_save_path","session_use_trans_sid","default_charset","disable_functions","enable_dl","session_hash_function","session_cookie_httponly"];
}

//checks = ["allow_url_fopen","allow_url_include","display_errors","file_uploads","expose_php","lowest_privilege_test","magic_quotes_gpc","","","","","","","","","","","","","","","","","","","","","","","","","","",""];

for(var c=0;c<= checks.length-1;c++)
{
	eval("unsafeWindow."+checks[c]+"_check()");
}

/*************[/SECURE SETTINGS]*************/



//alert(warnings);

	if(unsafeWindow.no!=0)
	{
		var div = document.createElement("div");
		div.setAttribute("id","yehgphpsecinfo");
		div.setAttribute("style","-moz-opacity:0.77;position:absolute;left:10%;right:10%;padding:1% 1% 1% 1%;top:1%;text-align:left;background-color:black;color:white;float:right;border:1px outset gray;");
		div.innerHTML = "<style>a{text-decoration:none;background-color:#D4FFAA!important;border:1px solid;}a:hover{background-color:#FF7F2A!important;color:floralwhite;}</style><span style='float:right;cursor:pointer;' title='YEHG.Net Lab' onclick='window.open(\"http://yehg.net/lab\");return false;'><img src='data:;base64,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'></span><h3 style='color:yellow!important;'><span style='text-align:center'>YEHG.Net Greasemonkey PHPSecInfo Checker</span> &nbsp;&nbsp;<span target='_blank' style='color:yellow!important;text-decoration:none;cursor:pointer;'   onclick=\"document.getElementById('yehgphpsecinfo').style.display='none'\">[x]</span></h3><br>"+ unsafeWindow.warnings + "<br/><br/><hr style=\"with:1000%\"/><h2>Summary</h2>Critical Settings Errors : <span style=\"color:red;font-weight:bold\">" + unsafeWindow.criticals + "</span><br/><br/>";
		document.body.appendChild(div);
	}
}