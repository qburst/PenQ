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

function getPayloadFilePath($filed){
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	const nsILocalFile= Components.interfaces.nsILocalFile;
		
	var f = Components.classes["@mozilla.org/file/local;1"].createInstance(nsILocalFile);
	var fp = Components.classes["@mozilla.org/filepicker;1"]
				   .createInstance(nsIFilePicker);

	var currentWorkingDirForWfuzz = Components.classes["@mozilla.org/file/directory_service;1"]
										 .getService(Components.interfaces.nsIDirectoryServiceProvider)
										 .getFile("CurProcD",{}).path;                               
	var wordlist_path = currentWorkingDirForWfuzz+'/utilities/wfuzz/wordlist';         
	f.initWithPath(wordlist_path);

	fp.displayDirectory = f;
	fp.init(window, "Select payload", nsIFilePicker.modeOpen);
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
                                        
function RunFuzz($Fuzzurl)
{

	if( !$Fuzzurl){
	alert('Please provide a url to fuzz');
	exit;
	}
	$parameters =  '';
	if (document.getElementById('payloadFile1').value ){
		if (document.getElementById('payload1').value == "file"){
		$parameters +=  ' -z file,';
		}
		if (document.getElementById('payload1').value == "method"){
		$parameters +=  ' -z file,';
		}
		if (document.getElementById('payload1').value == "list"){
		$parameters +=  ' -z list,';
		}
		if (document.getElementById('payload1').value == "range"){
		$parameters +=  ' -z range,';
		}
		if (document.getElementById('payload1').value == "hexrange"){
		$parameters +=  ' -z hexrange,';
		}
		$parameters +=  document.getElementById('payloadFile1').value;
		if (document.getElementById('encoding1').value != "none"){
		$parameters +=  ','+document.getElementById('encoding1').value;
		}
		}
	if (document.getElementById('payloadFile2').value ){
		if (document.getElementById('payload2').value == "file"){
		$parameters +=  ' -z file,';
		}
		if (document.getElementById('payload2').value == "list"){
		$parameters +=  ' -z list,';
		}
		if (document.getElementById('payload2').value == "range"){
		$parameters +=  ' -z range,';
		}
		if (document.getElementById('payload2').value == "hexrange"){
		$parameters +=  ' -z hexrange,';
		}
		$parameters +=  document.getElementById('payloadFile2').value;
		if (document.getElementById('encoding2').value != "none"){
		$parameters +=  ','+document.getElementById('encoding2').value;
		}
		}
	if (document.getElementById('payloadFile3').value ){
		if (document.getElementById('payload3').value == "file"){
		$parameters +=  ' -z file,';
		}
		if (document.getElementById('payload3').value == "list"){
		$parameters +=  ' -z list,';
		}
		if (document.getElementById('payload3').value == "range"){
		$parameters +=  ' -z range,';
		}
		if (document.getElementById('payload3').value == "hexrange"){
		$parameters +=  ' -z hexrange,';
		}
		$parameters +=  document.getElementById('payloadFile3').value;
		if (document.getElementById('encoding3').value != "none"){
		$parameters +=  ','+document.getElementById('encoding3').value;
		}
		}
	if (document.getElementById('timeDelay').value ){
		$parameters +=  " -s "+document.getElementById('timeDelay').value;
		}
	if (document.getElementById('thread').value ){
		$parameters +=  " -t "+document.getElementById('thread').value;
		}
	if (document.getElementById('postdata').value ){
		$parameters +=  " -d "+ '\"' +document.getElementById('postdata').value+'\"';
		}
	if (document.getElementById('recursiveDepth').value ){
		$parameters +=  " -R "+document.getElementById('recursiveDepth').value;
		}
	if (document.getElementById('headersField').value ){
		$parameters +=  " -H "+ '\"' +document.getElementById('headersField').value+'\"';
		}
	if (document.getElementById('payload1').value == "method"){
		$parameters +=  ' -X ';
		}
	if (document.getElementById('filter1Field').value ){
		
		$parameters +=  ' --hc '+document.getElementById('filter1Field').value;
		}
	if (document.getElementById('filter2Field').value ){
		
		$parameters +=  ' --hl '+document.getElementById('filter2Field').value;
		}
	if (document.getElementById('filter3Field').value ){
		
		$parameters +=  ' --hw '+document.getElementById('filter3Field').value;
		}
	if (document.getElementById('filter4Field').value ){
		
		$parameters +=  ' --hh '+document.getElementById('filter4Field').value;
		}
	if (document.getElementById('filter5Field').value ){
		
		$parameters +=  ' --hs '+document.getElementById('filter5Field').value;
		}		
				$Fuzzurl = $parameters+" -o html "+$Fuzzurl;
		 	//alert($Fuzzurl);
  	netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
	                           .getService(Components.interfaces.nsIProperties)
	                           .get("TmpD", Components.interfaces.nsIFile);
	                           
	
	var currentWorkingDir = Components.classes["@mozilla.org/file/directory_service;1"]
                                     .getService(Components.interfaces.nsIDirectoryServiceProvider)
                                     .getFile("CurProcD",{}).path;

	var terminal_path = currentWorkingDir+"/utilities/wfuzzPenQ";

	var file = Components.classes["@mozilla.org/file/local;1"].
	             createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(terminal_path);

	var process = Components.classes["@mozilla.org/process/util;1"].
	              createInstance(Components.interfaces.nsIProcess);
	
	 var args = [];
	 process.init(file);
	 var url = $Fuzzurl;
	 
	var args = [url];
	
	//alert (document.getElementById('urlbar').value);
    process.run(false, args, args.length);
    private.notify('PenQ Notify', 'PenQ Fuzzer has started. Result will be displayed when finished');
}


function setListField($val){
	$select = 'payload'+$val;
	
	if (document.getElementById($select).value == 'file') {
	$fields = 'payloadFile'+$val;
	$button = 'payloadButton'+$val;
	document.getElementById($fields).placeholder = "open payload"; 
	document.getElementById($fields).disabled = "disabled";
	document.getElementById($fields).value = "";
	document.getElementById($button).disabled = ""; 
		}
		
	if (document.getElementById($select).value == 'list') {
	$fields = 'payloadFile'+$val;
	$button = 'payloadButton'+$val;
	document.getElementById($fields).placeholder = "dir-dir2-dir3"; 
	document.getElementById($fields).disabled = ""; 
	document.getElementById($fields).value = "";
	document.getElementById($button).disabled = "disabled"; 
		}

	if (document.getElementById($select).value == 'range') {
	$fields = 'payloadFile'+$val;
	$button = 'payloadButton'+$val;
	document.getElementById($fields).placeholder = "1-400"; 
	document.getElementById($fields).disabled = ""; 
	document.getElementById($fields).value = "";
	document.getElementById($button).disabled = "disabled"; 
		}
	if (document.getElementById($select).value == 'hexrange') {
	$fields = 'payloadFile'+$val;
	$button = 'payloadButton'+$val;
	document.getElementById($fields).placeholder = "1-fff"; 
	document.getElementById($fields).disabled = "";
	document.getElementById($fields).value = "";
	document.getElementById($button).disabled = "disabled";  
		}
	if (document.getElementById($select).value == 'method') {
	$fields = 'payloadFile'+$val;
	$button = 'payloadButton'+$val;
	document.getElementById($fields).placeholder = "open payload for methods"; 
	document.getElementById($fields).disabled = "disabled"; 
	document.getElementById($fields).value = "";
	document.getElementById($button).disabled = ""; 
		}
	}

function setUrlField(){
	
	var currentUrl = document.getElementById('urlbar').value;
	if(currentUrl){
	    var pattern = /(ftp|http|https):\/\//;
        if (pattern.test(currentUrl)) {
            document.getElementById('url-box').value = currentUrl;    
        }else{
			document.getElementById('url-box').value = 'http://'+currentUrl;  
		}
	}else {
		alert('url bar is empty');
		}
}

