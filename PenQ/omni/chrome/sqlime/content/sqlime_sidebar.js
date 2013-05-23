/*
Copyright 2007 Security Compass

This file is part of SQL Inject Me.

SQL Inject Me is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

SQL Inject Me is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with SQL Inject Me.  If not, see <http://www.gnu.org/licenses/>.

If you have any questions regarding SQL Inject Me please contact
tools@securitycompass.com
*/

/**
 * Sidebar.js
 * @requires AttackRunner.js
 */

/**
 * These constants are used as ids for the types of test we can run.
 */
const TestType_AllTestsForForm = 1;
const TestType_PrefNumTestsForForm = 2;
const TestType_OneTestForForm = 3;
const TestType_AllTestsForAllForms = 4;

const STOP_ALL = Components.interfaces.nsIWebNavigation.STOP_ALL;

const __sqli_me_prefs_to_disable = [
        {"name": "security.warn_entering_secure", "type":"bool", "ourValue": false},
        {"name": "security.warn_entering_weak", "type":"bool", "ourValue": false},
        {"name": "security.warn_leaving_secure", "type":"bool", "ourValue": false},
        {"name": "security.warn_submit_insecure", "type":"bool", "ourValue": false},
        {"name": "security.warn_viewing_mixed", "type":"bool", "ourValue": false},
        {"name": "dom.max_chrome_script_run_time", "type":"int", "ourValue": 0},
        {"name": "signon.autofillForms", "type":"bool", "ourValue":false}, /* to remove autofilling forms in Fx3 */
        {"name": "signon.prefillForms", "type":"bool", "ourValue":false}, /* same as above but for Fx2 */
        {"name": "signon.rememberSignons", "type":"bool", "ourValue":false},
        {"name": "accessibility.typeaheadfind.enablesound", "type":"bool", "ourValue":false}
        ];
 
/**
 * get a reference to the main firefox window
 */
function getMainWindow(){
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebNavigation)
            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
            .rootTreeItem
            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindow);
    return mainWindow;
}

/**
 * get a reference to the document object of the page that is being viewed now
 */
function getMainHTMLDoc(){
    var mainWindow = getMainWindow();
    var elTabBrowser = mainWindow.document.getElementById('content');
    var currentDocument = elTabBrowser.contentDocument;
    return currentDocument;
}
 
 
function getMainHTMLWindow() {
    var mainWindow = getMainWindow();
    var elTabBrowser = mainWindow.document.getElementById('content');
    var win  = elTabBrowser.contentWindow;
    return win;
}

function extension(){
    //do nothing right now...
    this.plistener = null;
    this.warningDialog = null;
    this.typeAheadSound = true; //default for
    this.prefs = new Array();
}

extension.prototype = {
    getTestType: function(event){
        var tabbox = document.getElementById('sidebarformtabbox');
        var rv = new Object();
        var buttonClicked = event.explicitOriginalTarget;
        
        if (buttonClicked.className && buttonClicked.className ===
            'run_form_test')
        {
            
            rv.singleFormTest = true;
            
            if (tabbox.selectedPanel == null) {
                tabbox.selectedIndex = 0
            }

            if ( tabbox.selectedPanel.
                getElementsByAttribute('class', 'TestType').item(0).
                selectedItem.value == TestType_AllTestsForForm)
            {
                rv.allTests = true;
            }
            else {
                rv.allTests = false;
            }
            
        }
        else {
            rv.singleFormTest = false;
            if (buttonClicked.id === 'test_all_forms_with_all_attacks'){
                rv.allTests=true;
            }
            else {
                rv.allTests = false;
            }
        }
        
        /* cache the number of attacks early */
        rv.count = getAttackStringContainer().getStrings().length;
        if (rv.allTests === false) {
            var prefNumAttacks = this.getPreferredNumberOfAttacks();
            
            rv.count = (prefNumAttacks > rv.count) ? rv.count : prefNumAttacks;
            
        }
        
        return rv;
    }
    ,
    getMarkedFieldsForPanel:function(formPanel, all, formIndex) {
        var fieldUIs = formPanel.getElementsByAttribute('class', 'nolabel');
        var fieldsToTest = new Array();
        
        for(var i =0; i < fieldUIs.length; i++){
            if (fieldUIs[i].checked || all === true){
                var fieldToTest = new Object();
                fieldToTest.index = parseInt(fieldUIs[i].getAttribute('formElementIndex'));
                fieldToTest.name = getMainHTMLDoc().forms[formIndex].elements[fieldToTest.index].name;
                fieldsToTest.push(fieldToTest);
            }
        }
        return fieldsToTest;
    }
    ,
    /**
     * iterate through all these fields and find all the marked ones
     * @param testType the type of test that is being run.
     * @returns a list of fields to test
     */
    getFieldsToTest: function(testType) {
        var rv = null;
        var tabbox = document.getElementById('sidebarformtabbox');
        var mainDoc = getMainWindow().document.getElementById('content').contentDocument;
                
        if (testType.singleFormTest) {
            rv = this.getMarkedFieldsForPanel(tabbox.selectedPanel, false, tabbox.selectedIndex);
            for each (field in rv) {
                field.formIndex = tabbox.selectedIndex;
                field.formName = getHTMLFormElementNameOrLabel(mainDoc.forms[tabbox.selectedIndex]);
            }
        }
        else {
            /* @todo is using ._tabpanels safe here? ._tabpanels is a
               cached version of the panels */
            for (var n = 0; n < tabbox._tabpanels.childNodes.length; n++) {
                /* @todo is using ._tabpanels safe here? ._tabpanels is a
                   cached version of the panels */
                var temp = this.getMarkedFieldsForPanel(tabbox._tabpanels.
                        childNodes.item(n), true, n);
                for each (field in temp) {
                    field.formIndex = n;
                    field.formName = getHTMLFormElementNameOrLabel(mainDoc.forms[n]);
                    
                }
                if (rv) {
                    rv = rv.concat(temp);
                }
                else {
                    rv = temp;
                }
            }
        }
        return rv;
    }
    ,
    run_tests: function(event){
        
        var canRunTests = this.preTest();
        
        if (canRunTests == false){
            alert('Could not run tests as test are already running. Please ' +
                  'wait for these tests to finish.')
            return;
        }
        
        var testType = this.getTestType(event);
        var fieldsToTest = this.getFieldsToTest(testType);
        var testCount = 0;
        var tabManager = new TabManager(getMainWindow().getBrowser().selectedTab.linkedBrowser);
        
        if (fieldsToTest.length === 0) {
            alert('Please make sure you have selected fields to test.')
            this.postTest();
            testCount = fieldsToTest.length * heuristicTestChars.length;
            return;
        }
        else {
            testCount = fieldsToTest.length * testType.count;
        }
        
        this.warningDialog = window.openDialog(
                'chrome://sqlime/content/whiletestruns.xul', 'whiletestruns',
                'chrome,dialog,dependant=yes', testCount, testType);
        
        var testManager = getTestManager(this);
        
        testManager.runTest(testType, fieldsToTest, tabManager);        
    }
    ,
    createActionUI: function() {
        var box = document.createElement('hbox');
        var menulist = document.createElement('menulist');
        var menupopup = document.createElement('menupopup');
        var runTests_mi = document.createElement('menuitem');
        var runTopTests_mi = document.createElement('menuitem');
        var submitThisForm_mi = document.createElement('menuitem');
        var button = document.createElement('button');
        var rv = new Object();
     
        rv.menuitems = [];
     
        runTests_mi.setAttribute('label', "Run all tests");
        runTests_mi.setAttribute('value', TestType_AllTestsForForm);
        runTests_mi.setAttribute('selected', TestType_AllTestsForForm);

        runTopTests_mi.setAttribute('label', "Run top " + this.
                getPreferredNumberOfAttacks() + " tests");
        runTopTests_mi.setAttribute('value', TestType_PrefNumTestsForForm);
        
        
        submitThisForm_mi.setAttribute('value', TestType_OneTestForForm);
        
        rv.menuitems.push(runTopTests_mi);
        rv.menuitems.push(runTests_mi);
     
         //menulist.setAttribute("editable", false);
        rv.menupopup= menupopup;
     
        button.setAttribute('label', "Execute");
        button.setAttribute('command', 'sqlime_do_test');
        button.className = 'run_form_test';
        
        menulist.setAttribute('class', 'TestType');
        rv.menulist = menulist;
        
        
        rv.button = button;
     
        rv.box = box;
     
        return rv;
    }
    ,
    syncSidebarToForm: function(sidebarElement, formElement){
        
                        
        var assignSidebarValueToFormElement = function(event){
            formElement.value=sidebarElement.value.toString();
        }
                        
        var assignFormElementValueToSideBar =  function(event){
            sidebarElement.value = formElement.value.toString();
        }
        
        var w = window;
        var htmlContentWindow = getMainHTMLWindow();
        
        var releaseMemory = function(event){
            formElement.removeEventListener('keypress', 
                    assignFormElementValueToSideBar, true);
            formElement.removeEventListener('mouseup', 
                    assignFormElementValueToSideBar, true);
            formElement.removeEventListener('change', 
                    assignFormElementValueToSideBar, true);
            sidebarElement.removeEventListener('input', 
                    assignSidebarValueToFormElement, true);
            sidebarElement.removeEventListener('click', 
                    assignSidebarValueToFormElement, true);
            w.removeEventListener('unload', arguments.callee, true);
            htmlContentWindow.removeEventListener('unload', arguments.callee,
                    true);
        }
        
        formElement.addEventListener('keypress', assignFormElementValueToSideBar, true);
        formElement.addEventListener('mouseup', assignFormElementValueToSideBar, true);
        formElement.addEventListener('change', assignFormElementValueToSideBar, true);
        sidebarElement.addEventListener('input', assignSidebarValueToFormElement, true);
        sidebarElement.addEventListener('click', assignSidebarValueToFormElement, true);
        htmlContentWindow.addEventListener('unload', releaseMemory, true);
        w.addEventListener('unload', releaseMemory, true);
        
        
    }
    ,
    do_generate_form_ui: function() {
        var q = 0;
        var maindoc = getMainWindow().document.getElementById('content').contentDocument;
        var box = document.getElementById('sqlime_here_be_tabs');
        var docforms = maindoc.getElementsByTagName('form');
        var unnamedFormCounter = 0; //used for generating the unnamed form names 
        var tabbox = document.createElement('tabbox');
        var tabs = document.createElement('tabs');
        var tabpanels = document.createElement('tabpanels');
        var fieldsLabel = document.createElement('label');
        var sidebarBuilder = getSidebarBuilder();
        fieldsLabel.setAttribute('value', "These are the fields in this form:");
        
        tabbox.setAttribute('id', 'sidebarformtabbox');
        //we only want to put things in a clean box.
        if (box.childNodes.length !== 0) {
            for (var i = 0; i < box.childNodes.length; i++) {
                box.removeChild(box.childNodes[i]);
            }
        }
    
        // create the form UI
        // Note that the addition of the DOM is seperated from the creation of 
        // it in the hopes that it will make for a faster overall operation 
        // even though it does require a bit more work in the code. This is 
        // based on Mossop(David Townshed)'s advice.
        if (maindoc.forms.length !== 0){
            var attackStringContainer = getAttackStringContainer();
            attackStringContainer.init();
            
            var newTabs = [];
            var newTabForms= [];
            var newTabPanels = [];
            var newTabActions = [];
            var newTabPanelVbox = [];
            
            for (var i = 0; i < maindoc.forms.length; i++){
            
                var aForm = maindoc.forms[i];
                var formname = null;
                var formPanel = document.createElement("tabpanel");
                var fieldsWithUI = new Object();    
                var formTab = document.createElement("tab");
                
                dump(q++ + "\n");
                
                // Since the name attribute is deprecated for the form tag we first 
                // check the id attribute, then the name attribute and then consider
                // it unnamed.
                if (aForm.id){
                    formname = aForm.id;
                }
                else if (aForm.name){ 
                    formname = aForm.name;
                }
                else {
                    formname = "Unnamed form " + (++unnamedFormCounter);
                }
                
                formTab.setAttribute("label", formname);
                
                dump('aForm.elements.length: ' + aForm.elements.length +'\n');
                
                //iterate through the forms and generate the DOM.
                if (aForm.elements.length !== 0){
                    for (var n = 0; n < aForm.elements.length; n++){
                        var sidebarElement = null;
                        dump('aForm.elements[' + n + '] = ' +aForm.elements[n] + 
                                '- ' + aForm.elements[n].id +'\n');
                        if (aForm.elements[n].name){
                            sidebarElement = 
                                    fieldsWithUI[aForm.elements[n].name] =
                                    createFieldUI(aForm.elements[n], n);
                        }
                        else if (aForm.elements[n].id){
                            sidebarElement =
                                    fieldsWithUI[aForm.elements[n].id] =
                                    createFieldUI(aForm.elements[n], n );
                        }
                        else {
                            sidebarElement = 
                                    fieldsWithUI["form" + n + "_"+ 
                                    Math.round(Math.random() * 10000000)] =
                                    createFieldUI(aForm.elements[n], n);
                        }
                        sidebarElement = sidebarElement.getElementsByAttribute('editable', 'true')[0];
                        this.syncSidebarToForm(sidebarElement, aForm.elements[n]);
                        
                    }
                    
                }
                
                var actionButtons = this.createActionUI();
                newTabs.push(formTab);
                newTabForms.push(fieldsWithUI);
                newTabPanels.push(formPanel);
                newTabActions.push(actionButtons);
                newTabPanelVbox.push(document.createElement("vbox"));
            
            }
            
            /* the order of the below is very important. If the order is
              changed then not only will the display change but some things
              will break (certain attributes are checked only by grandparents
              on addition to the DOM, ex. selected). */
            
            //Add the form UI to the DOM.
            for (var i = newTabs.length-1; i >= 0; i--) {

                for each(var fieldUI in newTabForms[i]) {
                    sidebarBuilder.add(newTabPanelVbox[i], fieldUI, selectFirstMenuItemForField);
                }

                /* the order from here ...*/
                sidebarBuilder.add(newTabActions[i].box,
                        newTabActions[i].menulist);
                
                sidebarBuilder.add(newTabActions[i].menulist,
                        newTabActions[i].menupopup);
                
                for each(var mi in newTabActions[i].menuitems){
                    //newTabActions[i].menupopup.appendChild(mi);
                    sidebarBuilder.add(newTabActions[i].menupopup, mi);
                }
                
                /* to here is particularly crucial and annoying */
                
                sidebarBuilder.add(newTabActions[i].box,
                        newTabActions[i].button);
                sidebarBuilder.add(newTabPanelVbox[i],
                        newTabActions[i].box);
                sidebarBuilder.add(newTabPanels[i], newTabPanelVbox[i]);
                sidebarBuilder.add(tabs, newTabs[i]);
                sidebarBuilder.add(tabpanels, newTabPanels[i]);
            }
            

            sidebarBuilder.add(tabbox, tabpanels);
            sidebarBuilder.add(tabbox, tabs);
            
        }
        else {
            
            var noformPanel = document.createElement("tabpanel");
            var noformTab = document.createElement("tab");
            var labelinpanel = document.createElement("label");
            var noformPanelVbox = document.createElement("vbox");
            
            labelinpanel.setAttribute("value", "Sorry, this page has no forms.");
            
            noformTab.setAttribute("label", "No Forms");
            
            sidebarBuilder.add(tabs, noformTab);
            sidebarBuilder.add(tabpanels, noformPanel);
            sidebarBuilder.add(noformPanel, noformPanelVbox);
            sidebarBuilder.add(noformPanelVbox, labelinpanel);
            sidebarBuilder.add(tabbox, tabpanels);     
            sidebarBuilder.add(tabbox, tabs);

        }
        
        sidebarBuilder.add(box, tabbox);

        sidebarBuilder.start();
        
    }
    ,
    addAllMainWindowEventListeners: function() {
        
        var mainWindow = getMainWindow();
        var ourCaller = this;
        this.windowEventClosure = function(){ourCaller.do_generate_form_ui()};
        mainWindow.getBrowser().tabContainer.
                addEventListener("TabSelect", 
                this.windowEventClosure, false);
        
        this.plistener = new sqlimeProgressListener(
            this.windowEventClosure);
        
        mainWindow.document.getElementById('content').
                addProgressListener(this.plistener,
                Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
        
        this.sidebarBuilderPauseObserver = new Xss_PrefObserver(watchSidebarBuilderPausePref);
        
        var prefService = Components.classes['@mozilla.org/preferences-service;1'].
                getService(Components.interfaces.nsIPrefService);
        
        var branch = prefService.getBranch('');
        
        var observableBranch = branch.
                QueryInterface(Components.interfaces.nsIPrefBranch2);
                
        observableBranch.addObserver('extensions.sqlime.sidebarbuildingstop',
                                     this.sidebarBuilderPauseObserver, false);
        
    }
    ,
    removeAllMainWindowEventListeners: function (){
        var mainWindow = getMainWindow();
        
        mainWindow.document.getElementById('content').
                removeProgressListener(this.plistener);
                
        if (this.windowEventClosure) {
            mainWindow.getBrowser().tabContainer.
                    removeEventListener('TabSelect',
                            this.windowEventClosure,
                            false);
            this.windowEventListenerClosure = null;
        }
        var prefService = Components.classes['@mozilla.org/preferences-service;1'].
                getService(Components.interfaces.nsIPrefService);
        
        var branch = prefService.getBranch('');
        
        var observableBranch = branch.
                QueryInterface(Components.interfaces.nsIPrefBranch2);
                
        observableBranch.removeObserver('extensions.sqlime.sidebarbuildingstop',
                this.sidebarBuilderPauseObserver)
        
    }
    ,
    getPreferredNumberOfAttacks: function(){
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
            getService(Components.interfaces.nsIPrefService);
        var branch = prefs.getBranch("extensions.sqlime.");
        return branch.getIntPref("prefnumattacks");   
    }
    ,
    /**
     * This function does two things:
     * 1. Checks if we can run a test
     * 2. Preps the browser for testing (changing prefs, etc.)
     * @returns true if we can test, false otherwise.
     */
    preTest: function() {
        var rv = false;
        if (this.warningDialog === null){
            rv = true;
            
            var prefService = Components.
                    classes['@mozilla.org/preferences-service;1'].
                    getService(Components.interfaces.nsIPrefService);
            var branch = prefService.getBranch("");
            for each (var prefInfo in __sqli_me_prefs_to_disable) {                
                var origValue;
                var errorState = false;
                switch(prefInfo.type){
                    case 'bool':
                        try {
                            origValue = branch.getBoolPref(prefInfo.name);
                            branch.setBoolPref(prefInfo.name, prefInfo.ourValue);
                        }
                        catch(e){
                            Components.utils.reportError(e +' with '+ prefInfo.name);
                            errorState = true;
                        }
                        break;
                    case 'int':
                        try {
                            origValue = branch.getIntPref(prefInfo.name);
                            branch.setIntPref(prefInfo.name, prefInfo.ourValue);
                        }
                        catch(e){
                            Components.utils.reportError(e + ' with '+ prefInfo.name);
                            errorState = true
                        }
                        break;
                }
                
                if (!errorState) {
                
                    var backupPref = {
                            'name': prefInfo.name,
                            'type': prefInfo.type,
                            'origValue': origValue};
                    
                    this.prefs.push(backupPref);
                }
            }
            
        }
        return rv;
        
    }
    ,
    postTest: function(){
        this.warningDialog.close();
        this.warningDialog = null;
        var prefService = Components.
                    classes['@mozilla.org/preferences-service;1'].
                    getService(Components.interfaces.nsIPrefService);
        var branch = prefService.getBranch("");
        for each(var backupPref in this.prefs) {
                switch(backupPref.type){
                    case 'bool':
                        try {
                            branch.setBoolPref(backupPref.name, backupPref.origValue);
                        }
                        catch(e){
                            Components.utils.reportError(e +'with '+ backupPref.name);
                        }
                        break;
                    case 'int':
                        try {
                            branch.setIntPref(backupPref.name, backupPref.origValue);
                        }
                        catch(e){
                            Components.utils.reportError(e + 'with '+ backupPref.name);
                        }
                        break;
                }
        }
        
        this.prefs.splice(0, this.prefs.length);
    }
    ,
    calculateWorseCaseNumTestsToRun: function(testType, fieldsToTest) {
        
        var rv = 0;
        
        var numFieldsToTest = fieldsToTest.length;
        
        if (testType.heuristicTest) {
            
            var numTestChars = this.getHeuristicTestChars().length;
            
            rv += numFieldsToTest * numTestChars;
            
        }
        
        rv += numFieldsToTest*testType.count*2; // *2 because there are both DOM and string tests to run
        Components.utils.reportError("worse case num tests = ("+numFieldsToTest+"*" +numTestChars+"+"+numFieldsToTest+ "*"+ testType.count+") = "+
                "("+ (numFieldsToTest*numTestChars) +"+"+ (numFieldsToTest*testType.count)+") = " +((numFieldsToTest*numTestChars) + (numFieldsToTest*testType.count))+ " = " + rv);
        return rv;
        
    }
    ,
    /**
     * Notify's the warningDialog (if it exists) that it should change its
     * state to notify them 
     */
    generatingReport: function(){
        if (this.warningDialog && this.warningDialog.closed === false) {
            this.warningDialog.generatingReport();
        }
    }
    ,
    /**
     * Called by the testmanager and resultsmanager to report that a test has
     * been completed so that the popup's UI can be updated
     */
    finishedTest: function() {
        Components.utils.reportError("foo");
        if (this.warningDialog.closed === false && typeof(this.warningDialog.finishedTest) == 'function') {
            this.warningDialog.finishedTest();
        }
        else if (typeof(this.warningDialog.finishedTest) != 'function') {
            Components.utils.reportError('warning dialog\'s finished test function is missing.');
        }
    }
}

 
/**
 * This function takes a form returns an associative array (Object object) of 
 * field name => field UI pairs (with the UI being appropriate for plugging
 * into a tabpanel for display. Recursive.
 * @param form a form
 * @param fields 
 * @returns an associative array (Object) of field name => field UI pairs
 */
function getFormFieldsUI(aForm, allFields) {
    var fields = allFields ? allFields : new Object();
    
    for (var child in aForm.elements){
        dump('examining child: ' + child + " " + child.nodeName+"\n");
        if (isFormField(child)){
            if (!fields[child.name]){   //We don't want a million option UIs
                                        // even if there are a million
                                        // options
                var childUI = createFieldUI(child);
                fields[child.name] = childUI;
            }
            dump(child.nodeName + "is a form field\n");
        }
        else {
            dump(child.nodeName + "is NOT a form field\n");
            fields = getForFieldsUI(child, fields);
        }
    }
    
    return fields;
}
/**
 * generate the ui for one form field.
 * Another option is to use XBL but it really doesn't seem to be worth 
 * the effort
 * @param node a form field
 * @param elementIndex the index of the element in the form's elements array.
 * @returns the root of the ui for a form field (a groupbox).
 */
function createFieldUI(node, elementIndex){
    
//     var uid = Math.round(Math.random() * 100000000000);
    dump("creating field ui\n");
    var root = document.createElement("groupbox");
    root.setAttribute("flex", 0);
    
    var caption = document.createElement("caption");
    
    if (node.name){
        caption.setAttribute("label", node.name);
    }
    else if(node.id){
        caption.setAttribute("label", node.id);
    }
    
    var hbox = document.createElement("hbox");
    dump("creating field ui...\n");
    var checkbox = document.createElement("checkbox");
    checkbox.className = "nolabel";
    checkbox.setAttribute('formElementIndex', elementIndex);
    
    var menulist = document.createElement("menulist");
    menulist.setAttribute("editable", true);

    dump("creating field ui.......\n");
    var menupopup = document.createElement("menupopup");
    
    var firstMenuItem = document.createElement("menuitem");
    if (node.value && node.value.length){
        firstMenuItem.setAttribute("label", node.value);
    }
    else {
        firstMenuItem.setAttribute("label",
            "Change this to the value you want tested");
    }
    firstMenuItem.setAttribute("selected", true);
    
    menupopup.appendChild(firstMenuItem);
    
    dump("creating field ui............................\n");
    var attackStringContainer = getAttackStringContainer();
    var attacks = attackStringContainer.getStrings();
    for (var i = 0; i < attacks.length; i++){
        var aMenuItem = document.createElement("menuitem");
        aMenuItem.setAttribute('label', attacks[i].string);
        aMenuItem.setAttribute('width', '100');
        aMenuItem.setAttribute('crop', 'end');
        menupopup.appendChild(aMenuItem);
        dump("menupopup childnodes length: " + menupopup.childNodes.length+"\n");
    }
    
    menulist.appendChild(menupopup);
    menulist.selectedIndex = 0;
    
    hbox.appendChild(checkbox);
    hbox.appendChild(menulist);
    
    root.appendChild(caption);
    root.appendChild(hbox);
    dump("creating field ui................................................\n");
    return root;

}

/**
 * This function checks whether the passed in DOMNode is form field or some 
 * other type of tag.
 * @param node the node to check
 * @returns true if the elemenet is a form field, false otherwise
 */
function isFormField(node){

    switch (node.tagName.toLowerCase()){
        case "input":
        case "option":
        case "button":
        case "textarea":
        case "submit":
                return true;
        default:
                return false;
    }
}

/**
 * Watches the sidebar builder pause time preference and sets 
 */
function watchSidebarBuilderPausePref(subject, topic, data) {
    var prefService = Components.classes['@mozilla.org/preferences-service;1'].
            getService(Components.interfaces.nsIPrefService);
    var branch = prefService.getBranch('extensions.sqlime.');
    
    getSidebarBuilder().time = branch.getIntPref('sidebarbuildingstop');
}
/**
 * This function is used to make sure that the first tab panel is selected
 * in a tabbox
 * @param parent the tabbox
 * @param child the tabpanels element
 */
function ensureFirstTabPanelIsSelected(parent, child) {
    parent.selectedIndex= parent._tabpanels.selectedIndex = 0;
}

/**
 * This function is used to make sure that first child of the menu drop down
 * box.
 * @param parent
 * @param child menu list box.
 */
function ensureFirstChildOfMenuBox(parent, child) {
    parent.selectedIndex = 0;
    dump('changing index.\n')
}

/**
 * Selects the first item in a menubox. Used with the retun value of
 * createFieldUI.
 * @param parent
 * @param child the groupbox holding a field's UI as returned by createFieldUI()
 */
function selectFirstMenuItemForField(parent, child) {
 
    dump("child.childNodes[1].childNodes[1].selectedIndex" + child.childNodes[1].childNodes[1].selectedIndex + " " + typeof(child.childNodes[1].childNodes[1].selectedIndex) + " "+ child.childNodes[1].childNodes[1].nodeName + "\n");
    child.childNodes[1].childNodes[1].selectedIndex = 1;
    dump("child.childNodes[1].childNodes[1].selectedIndex" + child.childNodes[1].childNodes[1].selectedIndex + " " + typeof(child.childNodes[1].childNodes[1].selectedIndex) + " "+ child.childNodes[1].childNodes[1].nodeName + "\n");
    dump('changing fieldUI Index\n')
 
}
