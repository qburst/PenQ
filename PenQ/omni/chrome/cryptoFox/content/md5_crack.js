if(!com.echammas.cryptofox.md5Crack) com.echammas.cryptofox.md5Crack={};
com.echammas.cryptofox.md5Crack = {
	
MD5DictionaryAttack:function (hash,path) 
{
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to read file was denied.");
	}
	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( path );
	if ( file.exists() == false ) {
		alert("File does not exist");
	}
	var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
		.createInstance( Components.interfaces.nsIFileInputStream );
	is.init( file,0x01, 00004, null);
	var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
		.createInstance( Components.interfaces.nsIScriptableInputStream );
	sis.init( is );
	var output = sis.read( sis.available() );
	var pattern = /\W+/;
	output = output.split(pattern);
	var success = 0;
	var line = 0;
	while(output[line] != "")
	{
		if(com.echammas.cryptofox.md5.hex_md5(output[line])==hash)
		{
			success = 1;
			document.getElementById("plainText").value = output[line];
			break;
		}
		line++;
	}
	if(success == 0)
	{
		document.getElementById("plainText").value = "Couldn't find the password!";
	}
}
}
