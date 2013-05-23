//@line 37 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/places/content/bookmarksPanel.js"
    var private = {};

    private.alertService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
    private.preferences  = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    private.cacheService = Components.classes["@mozilla.org/network/cache-service;1"].getService(Components.interfaces.nsICacheService);
    
    private.notify = function(title, body)
    {
        try
        {
            private.alertService.showAlertNotification("chrome://branding/content/icon48.png", title, body, false, "", null);
        }
        catch(exception)
        {
            // don't do anything if notification services aren't set up on the computer
        }
    }
    
function init() {
	alert(document.getElementById('urlbar').value);
  document.getElementById("url-box").value =
   document.getElementById('urlbar').value;
}

function getFilePath($filed){
	const nsIFilePicker = Components.interfaces.nsIFilePicker;

	var fp = Components.classes["@mozilla.org/filepicker;1"]
				   .createInstance(nsIFilePicker);
	fp.init(window, "Select File", nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

	var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		  var file = fp.file;
		  // Get the path as string. Note that you usually won't 
		  // need to work with the string paths.
		  var path = fp.file.path;
		  document.getElementById($filed).value = path;
		  // work with returned nsILocalFile...
		}else{
		document.getElementById($filed).value = "";
		}

	}

function searchBookmarks(aSearchString) {
  var tree = document.getElementById('bookmarks-view');
  if (!aSearchString)
    tree.place = tree.place;
  else
    tree.applyFilter(aSearchString,
                     [PlacesUtils.bookmarksMenuFolderId,
                      PlacesUtils.unfiledBookmarksFolderId,
                      PlacesUtils.toolbarFolderId]);
}

window.addEventListener("SidebarFocused",
                        function()
                          document.getElementById("search-box").focus(),
                        false);
                                        
function RunNikto($Niktourl)
{

	if( !$Niktourl){
	alert('Provide url to scan');
	exit;
	}
	$parameters =  '';
	if (document.getElementById('niktoUrl-box').value ){

		$parameters +=  ' -h '+document.getElementById('niktoUrl-box').value;
		
		}
	if (document.getElementById('niktoPort-box').value ){
		
		$parameters +=  ' -p '+document.getElementById('niktoPort-box').value;
		}
	if (document.getElementById('niktoProxy').value ){
		
		$parameters +=  ' -useproxy '+document.getElementById('niktoProxy').value;
		}	
	
	
	if (document.getElementById('pluginOption').value == '@@DEFAULT') {
		$parameters +=  ' -Plugins @@DEFAULT;report_html '
		}
	else if (document.getElementById('pluginOption').value == '@@ALL') {
		$parameters +=  ' -Plugins @@ALL '
		}
	else if (document.getElementById('pluginOption').value == '@@MUTATE') {
		$parameters +=  ' -Plugins @@MUTATE;report_html '
	}
	else if (document.getElementById('pluginOption').value == '@@NONE') {
		$parameters +=  ' -Plugins @@NONE;report_html '
		}
	else {
		
		$evaParameters =  'report_html';
		
		if (document.getElementById('plugin1').checked){
		$evaParameters +=  ';msgs';
		}
		if (document.getElementById('plugin2').checked){
		$evaParameters +=  ';apacheusers';
		}
		if (document.getElementById('plugin3').checked){
		$evaParameters +=  ';fileops';
		}
		if (document.getElementById('plugin4').checked){
		$evaParameters +=  ';mutiple_index';
		}
		if (document.getElementById('plugin5').checked){
		$evaParameters +=  ';paths';
		}
		if (document.getElementById('plugin6').checked){
		$evaParameters +=  ';put_del_test';
		}		
		if (document.getElementById('plugin7').checked){
		$evaParameters +=  ';tests';
		}		
		if (document.getElementById('plugin8').checked){
		$evaParameters +=  ';embedded';
		}		
		if (document.getElementById('plugin9').checked){
		$evaParameters +=  ';parked';
		}	
		if (document.getElementById('plugin10').checked){
		$evaParameters +=  ';content_search';
		}
		if (document.getElementById('plugin11').checked){
		$evaParameters +=  ';headers';
		}
		if (document.getElementById('plugin12').checked){
		$evaParameters +=  ';cookies';
		}
		if (document.getElementById('plugin13').checked){
		$evaParameters +=  ';ssl';
		}
		if (document.getElementById('plugin14').checked){
		$evaParameters +=  ';httpoptions';
		}
		if (document.getElementById('plugin15').checked){
		$evaParameters +=  ';robots';
		}
		if (document.getElementById('plugin16').checked){
		$evaParameters +=  ';cgi';
		}
		if (document.getElementById('plugin17').checked){
		$evaParameters +=  ';auth';
		}
		if (document.getElementById('plugin18').checked){
		$evaParameters +=  ';outdated';
		}
		if (document.getElementById('plugin19').checked){
		$evaParameters +=  ';dictionary';
		}
		if (document.getElementById('plugin20').checked){
		$evaParameters +=  ';apache_expect_xss';
		}
		if (document.getElementById('plugin21').checked){
		$evaParameters +=  ';subdomain';
		}			
		
		if ($evaParameters){
				
				$parameters +=  ' -Plugins '+$evaParameters ;
		}
		
	}	
							
	if (document.getElementById('basicAuth').value ){
		$parameters +=  " -id "+document.getElementById('basicAuth').value;
		}
	if (document.getElementById('prependRootValueField').value ){
		$parameters +=  " -root "+document.getElementById('prependRootValueField').value;
		}
	if (document.getElementById('virtualHostField').value){
		$parameters +=  " -vhost "+ document.getElementById('virtualHostField').value;
		}
	if (document.getElementById('timeoutForRequestsField').value){
		$parameters +=  " -timeout "+ document.getElementById('timeoutForRequestsField').value;
		}
	if (document.getElementById('sslModeSelect').value == "ssl"){
		$parameters +=  " -ssl ";
		}
	if (document.getElementById('sslModeSelect').value == "nossl"){
		$parameters +=  " -nossl ";
		}
	if (document.getElementById('no404Check').checked){
		$parameters +=  " -no404 ";
		}
						
		$tuningparameters =  "";
		if (document.getElementById('tuningOption').value == "exclude" ){
		$tuningparameters +=  "x";
		}
		if (document.getElementById('tuning0').checked){
		$tuningparameters +=  "0";
		}
				if (document.getElementById('tuning1').checked ){
		$tuningparameters +=  "1";
		}		
				if (document.getElementById('tuning2').checked){
		$tuningparameters +=  "2";
		}		
				if (document.getElementById('tuning3').checked){
		$tuningparameters +=  "3";
		}		
				if (document.getElementById('tuning4').checked){
		$tuningparameters +=  "4";
		}		
				if (document.getElementById('tuning5').checked){
		$tuningparameters +=  "5";
		}		
				if (document.getElementById('tuning6').checked){
		$tuningparameters +=  "6";
		}		
				if (document.getElementById('tuning7').checked){
		$tuningparameters +=  "7";
		}		
				if (document.getElementById('tuning8').checked){
		$tuningparameters +=  "8";
		}		
				if (document.getElementById('tuning9').checked){
		$tuningparameters +=  "9";
		}		
				if (document.getElementById('tuning10').checked){
		$tuningparameters +=  "a";
		}		
				if (document.getElementById('tuning11').checked){
		$tuningparameters +=  "b";
		}	
				if (document.getElementById('tuning12').checked){
		$tuningparameters +=  "c";
		}			
		if ($tuningparameters){
				
				$parameters +=  ' -Tuning '+$tuningparameters;
		}
				
			$Niktourl = $parameters;
		 //	alert($Niktourl);
		 	
	if (document.getElementById('niktoRunOptionsList').value == 'terminal') {
	
				$displayValues =  "";
				if (document.getElementById('display1').checked){
					$displayValues +=  "1";
					}
				if (document.getElementById('display2').checked ){
					$displayValues +=  "2";
					}		
				if (document.getElementById('display3').checked){
					$displayValues +=  "3";
					}		
				if (document.getElementById('display4').checked){
					$displayValues +=  "4";
					}		
				if (document.getElementById('display5').checked){
					$displayValues +=  "E";
					}		
				if (document.getElementById('display6').checked){
					$displayValues +=  "D";
					}
				if (document.getElementById('display7').checked){
					$displayValues +=  "P";
					}
				if (document.getElementById('display8').checked){
					$displayValues +=  "S";
					}
				if (document.getElementById('display9').checked){
					$displayValues +=  "V";
					}					
				if ($displayValues){
					
					$Niktourl +=  ' -Display '+$displayValues;
					}	
												
		 	  	netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
				var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
										   .getService(Components.interfaces.nsIProperties)
										   .get("TmpD", Components.interfaces.nsIFile);
										   
				
				var currentWorkingDir = Components.classes["@mozilla.org/file/directory_service;1"]
												 .getService(Components.interfaces.nsIDirectoryServiceProvider)
												 .getFile("CurProcD",{}).path;

				var terminal_path = currentWorkingDir+"/utilities/runNiktoTerminal";

				var file = Components.classes["@mozilla.org/file/local;1"].
							 createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(terminal_path);

				var process = Components.classes["@mozilla.org/process/util;1"].
							  createInstance(Components.interfaces.nsIProcess);
				var niktoString = 'perl '+currentWorkingDir+'/utilities/nikto/nikto/nikto.pl '+$Niktourl;
				var args = [];
				process.init(file);
				//alert(niktoString);
				var url = niktoString;
				 
				var args = [url];
				
				//alert (document.getElementById('urlbar').value);
				process.run(false, args, args.length);
				private.notify('PenQ Notify', 'Nikto has started in terminal.');
	}
	else if (document.getElementById('niktoRunOptionsList').value == 'save') {
				//if user select to save file 
				var deskDir = Components.classes["@mozilla.org/file/directory_service;1"]
												 .getService(Components.interfaces.nsIDirectoryServiceProvider)
												 .getFile("Desk",{}).path;
				var dNow = new Date();
				var nowT = dNow.getTime();

				if (document.getElementById('niktoSaveAsList').value == 'xml'){
					
					$Niktourl += " -F xml -output "+deskDir+"/niktoResult-"+nowT+".xml";
					
					}
				if (document.getElementById('niktoSaveAsList').value == 'nbe'){
					
					$Niktourl += " -F nbe -output "+deskDir+"/niktoResult-"+nowT+".nbe";
					
					}
				if (document.getElementById('niktoSaveAsList').value == 'htm'){
					
					$Niktourl += " -F htm -output "+deskDir+"/niktoResult-"+nowT+".html";
					
					}
				if (document.getElementById('niktoSaveAsList').value == 'csv'){
					
					$Niktourl += " -F csv -output "+deskDir+"/niktoResult-"+nowT+".csv";
					
					}	
							
		 	  	netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
				var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
										   .getService(Components.interfaces.nsIProperties)
										   .get("TmpD", Components.interfaces.nsIFile);
										   
				
				var currentWorkingDir = Components.classes["@mozilla.org/file/directory_service;1"]
												 .getService(Components.interfaces.nsIDirectoryServiceProvider)
												 .getFile("CurProcD",{}).path;

				var terminal_path = currentWorkingDir+"/utilities/saveNiktoResult";

				var file = Components.classes["@mozilla.org/file/local;1"].
							 createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(terminal_path);

				var process = Components.classes["@mozilla.org/process/util;1"].
							  createInstance(Components.interfaces.nsIProcess);
				var args = [];
				process.init(file);
				//alert($Niktourl);
				var url = $Niktourl;
				 
				var args = [url];

				process.run(false, args, args.length);
				notifyMsg = "Nikto has started. The result "+ document.getElementById('niktoSaveAsList').value +" file will soon be saved to your Desktop."
				private.notify('PenQ Notify', notifyMsg );
	}
	else {
    
				netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
				var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
										   .getService(Components.interfaces.nsIProperties)
										   .get("TmpD", Components.interfaces.nsIFile);
										   
				
				var currentWorkingDir = Components.classes["@mozilla.org/file/directory_service;1"]
												 .getService(Components.interfaces.nsIDirectoryServiceProvider)
												 .getFile("CurProcD",{}).path;

				var terminal_path = currentWorkingDir+"/utilities/niktoPenQ";

				var file = Components.classes["@mozilla.org/file/local;1"].
							 createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(terminal_path);

				var process = Components.classes["@mozilla.org/process/util;1"].
							  createInstance(Components.interfaces.nsIProcess);
				
			    var args = [];
				process.init(file);
				var url = $Niktourl;
				 
				var args = [url];
				//alert (document.getElementById('urlbar').value);
				process.run(false, args, args.length);
				private.notify('PenQ Notify', 'Nikto has started. Result will be displayed when finished');
     
	}
}

function setNiktoListField(){

	if (document.getElementById('urlType').value == 'url') {
	document.getElementById('niktoUrl-box').placeholder = "http://localhost"; 
	document.getElementById('payloadButton').disabled = "disabled";
	document.getElementById('niktoUrl-box').value = "";
	document.getElementById('niktoUrl-box').disabled = ""; 
	document.getElementById('fetchNiktoUrl').disabled = ""; 
		}
		
	if (document.getElementById('urlType').value == 'list') {

	document.getElementById('niktoUrl-box').placeholder = "Open url list file"; 
	document.getElementById('payloadButton').disabled = "";
	document.getElementById('niktoUrl-box').value = "";
	document.getElementById('niktoUrl-box').disabled = "disabled"; 
	document.getElementById('fetchNiktoUrl').disabled = "disabled"; 

		}
	}
	
function setNiktoPluginListField(){

	if (document.getElementById('pluginOption').value == 'custom') {
		for(i = 1 ;i < 22; i++) {
			document.getElementById('plugin'+i).disabled = false; 
			document.getElementById('plugin'+i).checked = false;
		}
	}
	else if (document.getElementById('pluginOption').value == '@@DEFAULT'){ 
			for(i = 1 ;i < 22; i++) {
			document.getElementById('plugin'+i).checked = true; 
		    document.getElementById('plugin'+i).disabled = true;
		    document.getElementById('plugin19').checked = false;  
		    document.getElementById('plugin21').checked = false;  
			}
		}
	else if (document.getElementById('pluginOption').value == '@@MUTATE'){ 
			for(i = 1 ;i < 22; i++) {
		    document.getElementById('plugin'+i).disabled = true;
		    document.getElementById('plugin'+i).checked = false;
		    document.getElementById('plugin19').checked = true;  
		    document.getElementById('plugin21').checked = true;  
			}
		}
	else if (document.getElementById('pluginOption').value == '@@NONE'){ 
			for(i = 1 ;i < 22; i++) {
		    document.getElementById('plugin'+i).disabled = true;
		    document.getElementById('plugin'+i).checked = false; 
			}
		}
	else if (document.getElementById('pluginOption').value == '@@ALL'){ 
			for(i = 1 ;i < 22; i++) {
			document.getElementById('plugin'+i).checked = true; 
		    document.getElementById('plugin'+i).disabled = true; 
			}
		}
	else {
	
		for(i = 1 ;i < 22; i++) {
			document.getElementById('plugin'+i).disabled = true; 
		}
	}
	
}
function setNiktoRunOptionsField(){

	if (document.getElementById('niktoRunOptionsList').value == 'terminal') {
		document.getElementById('displayLabel').style.display = "";
		document.getElementById('niktoSaveAsLabel').style.display = "none";
		document.getElementById('niktoSaveAsList').style.display = "none";
		for(i = 1 ;i < 10; i++) {
		    document.getElementById('display'+i).style.display = "";
			}
		}
	if (document.getElementById('niktoRunOptionsList').value == 'save') {
		document.getElementById('displayLabel').style.display = "none";
		document.getElementById('niktoSaveAsLabel').style.display = "";
		document.getElementById('niktoSaveAsList').style.display = "";
		for(i = 1 ;i < 10; i++) {
		    document.getElementById('display'+i).style.display = "none";
			}
		}
	if (document.getElementById('niktoRunOptionsList').value == 'html') {
		document.getElementById('displayLabel').style.display = "none";
		document.getElementById('niktoSaveAsLabel').style.display = "none";
		document.getElementById('niktoSaveAsList').style.display = "none";
		for(i = 1 ;i < 10; i++) {
		    document.getElementById('display'+i).style.display = "none";
			}
		}	
	}

function setNiktoUrlField(){
	
	var currentUrl = document.getElementById('urlbar').value;
	if(currentUrl){
	    var pattern = /(ftp|http|https):\/\//;
        if (pattern.test(currentUrl)) {
            document.getElementById('niktoUrl-box').value = currentUrl;    
        }else{
			document.getElementById('niktoUrl-box').value = 'http://'+currentUrl;  
		}
	}else {
		alert('url bar is empty');
		}
}

