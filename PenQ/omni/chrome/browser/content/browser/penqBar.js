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
 var newtReportPageUrl= {
setReportURL: function()
{
	var currentWorkingDir = Components.classes["@mozilla.org/file/directory_service;1"]
                                     .getService(Components.interfaces.nsIDirectoryServiceProvider)
                                     .getFile("CurProcD",{}).path;
    var reportUrl_path = 'file://'+currentWorkingDir+'/utilities/report/report.html';                                 
	document.getElementById('reportBrowser').loadURI(reportUrl_path)
	}
}
function showPositionAndSize()
{
  var labelbox = document.getElementById('thelabel').boxObject;

  alert("Position is (" + labelbox.x + "," + labelbox.y +
        ") and size is (" + labelbox.width + "," +
        labelbox.height + ")");
}

   
function RunUtility($path,alertHead, alertData)
{

  	netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
	                           .getService(Components.interfaces.nsIProperties)
	                           .get("TmpD", Components.interfaces.nsIFile);
	                          
	var currentWorkingDir = Components.classes["@mozilla.org/file/directory_service;1"]
                                     .getService(Components.interfaces.nsIDirectoryServiceProvider)
                                     .getFile("CurProcD",{}).path;

	var terminal_path = currentWorkingDir+$path;
	var file = Components.classes["@mozilla.org/file/local;1"].
	             createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(terminal_path);

	var process = Components.classes["@mozilla.org/process/util;1"].
	              createInstance(Components.interfaces.nsIProcess);
	
	 var args = [];
	 process.init(file);
	 var url = document.getElementById('urlbar').value;
	 
	var args = [url];
	
	//alert (document.getElementById('urlbar').value);
    process.run(false, args, args.length);
    if ( alertHead){
    private.notify(alertHead, alertData);}
    
}

function RunSysUtility($path,alertHead, alertData)
{

  	netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	var temp_file = Components.classes["@mozilla.org/file/directory_service;1"]
	                           .getService(Components.interfaces.nsIProperties)
	                           .get("TmpD", Components.interfaces.nsIFile);
	                    

	var terminal_path = $path;
	
	var file = Components.classes["@mozilla.org/file/local;1"].
	             createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(terminal_path);

	var process = Components.classes["@mozilla.org/process/util;1"].
	              createInstance(Components.interfaces.nsIProcess);
	
	 var args = [];
	 process.init(file);
	 var url = document.getElementById('urlbar').value;
	 
	var args = [url];
	
	//alert (document.getElementById('urlbar').value);
    process.run(false, args, args.length);
    if ( alertHead){
    private.notify(alertHead, alertData);}
    
}

var newtabhomepage = {

  init: function ()
  {
    gBrowser.removeEventListener("NewTab", BrowserOpenTab, false);
    window.BrowserOpenTab = newtabhomepage.opentab;
    
    // explicitly add new listener
    gBrowser.addEventListener("NewTab", newtabhomepage.opentab, false);
    
    newtabhomepage.prefs = Components.classes['@mozilla.org/preferences-service;1']
                           .getService(Components.interfaces.nsIPrefService);
  },
  
  opentab: function (aEvent)
  {
    // Firefox allows multiple piped homepages, take the first if necessary
    var homepage = "about:newtab";
    var newtab = gBrowser.addTab(homepage);
 //   if (newtabhomepage.prefs.getBoolPref("newtabhomepage.selectnewtab"))
  //  {
      gBrowser.selectedTab = newtab;
      if (gURLBar)
        setTimeout(function() { 
          // if page is about:blank select() works just like focus, two birds one stone
          gURLBar.select();
        }, 0);
    //}
    if (aEvent)
      aEvent.stopPropagation();
    return newtab;
  }
}
window.addEventListener("load",newtabhomepage.init,false);

function togglePenQBar() {
 var penqBar = document.getElementById('QBPanel').hidden;
 var penqBarToggleButtonImage = document.getElementById('penqBarToggleButton').image;
 var newpenqBarState = !penqBar;
 document.getElementById('QBPanel').hidden = newpenqBarState;
 if (penqBarToggleButtonImage == "up28.png") {
	 document.getElementById('penqBarToggleButton').image = "down28.png";
	 }else{
		 document.getElementById('penqBarToggleButton').image = "up28.png";
		 }
}

function togglePenQTamberDataBar() {
 var penqTamberDataBar = document.getElementById('tamperSidebar-box').hidden;
 var penqTamberDataBarToggleButtonImage = document.getElementById('penqTamperDataToggleButton').image;
 var newpenqTamberDataBarState = !penqTamberDataBar;
 document.getElementById('tamperSidebar-box').hidden = newpenqTamberDataBarState;
 document.getElementById('tamperSidebar-splitter').hidden = newpenqTamberDataBarState;
  if (penqTamberDataBarToggleButtonImage == "nav-forward.png") {
	 document.getElementById('penqTamperDataToggleButton').image = "nav-back.png";
	 }else{
		 document.getElementById('penqTamperDataToggleButton').image = "nav-forward.png";
		 }
		 
}
