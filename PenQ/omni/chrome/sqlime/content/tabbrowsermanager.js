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
 * tabbrowsermanager.js
 * Much of this system relies on working with the tab browser. This file 
 * encapsulates all that functionality.
 */

/**
 * Captures information about the target page from the browser in the foreground tab,
 * since the user may change the state of that browser while the tests are in progress.
 * @param  browser a browser pointed at the page that the test battery will be run against
 * @return         a (new) TabManager object for use with the current test battery
 */
function TabManager(browser){

    // Cache the URL, referrer and postdata of the browser, for access via loadTargetPage().
    // Cache its contentDocument as a basis for comparison, to ensure other browsers have loaded correctly.
    this.targetContentDocument = browser.contentDocument;
    this.targetPagePostData = null;
    var sh = browser.sessionHistory;
    if (sh.count) {
        var currentEntry = sh.getEntryAtIndex((sh.index), false);
        if (currentEntry.postData) {
            var postDataStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .createInstance(Components.interfaces.nsIScriptableInputStream);
            postDataStream.init(currentEntry.postData);
            // Supposedly it's bad to retrieve all postData at once,
            // in case there's a lot of it, because other pseudothreads can't interrupt?
            var buffer = null;
            while (foo = postDataStream.read(512)) {
                this.targetPostData += buffer;
            }
        }
        this.targetPage = currentEntry.URI.spec;
        this.targetPageReferrer = currentEntry.referrerURI || null;
    }
    else {
        this.targetPage = browser.webNavigation.currentURI.spec;
        this.targetPageReferrer = null;
    }

    // Extract a list of the forms on the page.
    this.tabForms = new Array();
    var forms = browser.docShell.document.forms;
    for (var i = 0; i < forms.length; i++) {
        this.tabForms[i] = new Array();
        this.tabForms[i].elements ={};
        this.tabForms[i].elements.length = forms[i].elements.length;
        this.tabForms[i].action = forms[i].action ? forms[i].action : browser.contentDocument.
                location.toString();
        this.tabForms[i].method = forms[i].method;
        
        for (var j = 0; j < forms[i].elements.length; j++) {
            var elem = forms[i].elements[j];
            var elemToUse = {};
            elemToUse.nodeName = elem.nodeName;
            elemToUse.name = elem.name;
            switch (elem.nodeName.toLowerCase()) {
                case 'submit':
                case 'reset':
                case 'image':
                case 'button':
                case 'fieldset':
                    this.tabForms[i].push({});
                    this.tabForms[i].elements[elem.name] = this.tabForms[i].
                            elements[j] = {};
                    break;
                case 'checkbox':
                case 'radio':
                    elemToUse.checked = elem.checked;
                    elemToUse.name = elem.name
                    this.tabForms[i].push(elemToUse);
                    this.tabForms[i].elements[elemToUse.name] = this.tabForms[i].
                            elements[j] = elemToUse;
                    break;
                default:
                    elemToUse.value = elem.value;
                    elemToUse.name = elem.name
                    this.tabForms[i].push(elemToUse);
                    this.tabForms[i].elements[elemToUse.name] = this.tabForms[i].
                            elements[j] = elemToUse;
            }
        }
        if (! this.tabForms[forms[i].name]){
            this.tabForms[forms[i].name] = this.tabForms[i];
        }
    }
    
    this.index = browser.webNavigation.sessionHistory.index;
}

TabManager.prototype = {
    /**
     * Point a browser at the target page recorded by this TabManager.
     * @param browser the browser to point to the target page
     */
    loadTargetPage: function (browser) {
        browser.webNavigation.loadURI(this.targetPage, 0, this.targetPageReferrer, this.targetPagePostData, null);
    }
    ,
    writeTabForms: function(forms, testFormIndex, testFieldIndex, testData){
        dump('-=-=-=-writeTabForms::forms ' + forms[0]); 
        if (forms[testFormIndex] === undefined){
            dump('got an undefined\n');   
        }
        dump('&& and the test form is : '+forms[testFormIndex]+ ' with '+
                forms[testFormIndex].elements.length+'elements\n');
        for (var formIndex = 0;
             formIndex < forms.length;
             formIndex++)
        {
            for (var elementIndex = 0; 
                 elementIndex < forms[formIndex].elements.length; 
                 elementIndex++)
            {
                var element = forms[formIndex].elements[elementIndex];
                dump('checking whether this field ('+formIndex + ',' +elementIndex +')should be loaded with an evil value: ' + (formIndex === testFormIndex && elementIndex === testFieldIndex) + '\n');
                if (formIndex !== null && 
                    formIndex === testFormIndex && 
                    elementIndex === testFieldIndex &&
                    testData !== null
                   ) 
                {
                    dump('going to force element ' +element.name  +' ('+ elementIndex
                            +') to have value ' + testData+ '\n');
                    if(element.nodeName.toLowerCase() === 'select') {
                        var newOption = forms[formIndex].ownerDocument.createElement('option');
                        newOption.setAttribute('value', testData.string);
                        newOption.innerHTML = testData.string;
                        element.options[element.options.length] = newOption;
                        element.selectedIndex = element.options.length - 1;
                    }
                    else {
                        element.value = testData.string;
                    }
                    dump('element[' + elementIndex + '] has value' + 
                            element.value + ' \n');
                }
                else if (element.nodeName.toLowerCase() == 'submit' || 
                         element.nodeName.toLowerCase() == 'reset' || 
                         element.nodeName.toLowerCase() == 'image' || 
                         element.nodeName.toLowerCase() == 'button')
                {
                    // don't care, this is here just to make sure the elements 
                    // are parallel.
                } 
                else if (element.nodeName.toLowerCase() == 'checkbox' || 
                         element.nodeName.toLowerCase() == 'radio') 
                {
                    element.checked = this.tabForms[formIndex][elementIndex];
                }
                else {
                    element.value = this.tabForms[formIndex][elementIndex];
                }
            }
        }
    }
    ,
    getTabData: function(testFormIndex, testFieldIndex, testString){
        var rv = new Array();
        var formIndex = testFormIndex;
        var forms = this.tabForms;
        for (var elementIndex = 0; 
            elementIndex < forms[formIndex].elements.length; 
            elementIndex++)
        {
            var element = forms[formIndex].elements[elementIndex];
            var fieldInfo = new Object();
            fieldInfo.name = element.name;
            fieldInfo.data = (elementIndex == testFieldIndex && testString)?testString:element.value;
            fieldInfo.tested = (elementIndex == testFieldIndex);
            rv.push(fieldInfo);
        }
        return rv;
    }
    ,
    /**
     * This returns the data in a form 
     */
    getFormDataForURL: function(testFormIndex, testFieldIndex, 
            testData)
    {
        var formIndex = testFormIndex;
        var rv = '';
        var forms = this.tabForms;
        for (var elementIndex = 0; 
            elementIndex < forms[testFormIndex].elements.length; 
            elementIndex++)
        {
            var element = forms[testFormIndex].elements[elementIndex];
            if (rv.length != 0){
                rv+='&';
            }
            
            if (elementIndex == testFieldIndex) {
                rv += element.name +'='+testData;
            }
            else if (element.value) {
                rv += element.name +'='+element.value;
            }
            else if (element.checked !== undefined ) {
                rv += element + '=' + element.checked?1:0;
            }
        }
        return rv;
        
    }
};