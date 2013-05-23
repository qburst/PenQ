/*
Copyright 2007 Security Compass

This file is part of SQL Inject Me.

SQL Inject Me is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version

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
 * AttackRunner.js
 * @requires ResultsManager
 * @requires TabManager
 * @requires AttackHttpResponseObserver
 */

/**
 * @class AttackRunner
 */
function AttackRunner(){

    this.className = "AttackRunner";
    
    /**
     * uniqueID is important for heuristic tests which need a random string in
     * order to find the char they sent
     */
    this.uniqueID = Math.floor(Date.now() * Math.random());
    
    this.tabWrapper = null;
    
    this.resultsWrappers = new Array();
    
}

AttackRunner.prototype = {
    testData: null
    ,
    submitForm: function(browser, formIndex){
        var forms = browser.webNavigation.document.forms;
        var formFound = false;
        for (var i = 0; i < forms.length && !formFound; i++){
            if (i == formIndex){
                dump('submitting form ... ' + i + ' ' + (i == formIndex) + '\n');
                if (forms[i].target) forms[i].target = null;
                forms[i].submit();
                formFound = true;
            }
            //debug code..
            else {
                dump('this form is not it... ' + i + ' ' + (i == formIndex) + '\n');  
            }
        }
        return formFound;
    }
    ,
    /**
     * Begin an individual test.
     * @param formPanel      currently unused
     * @param formIndex      index, in the list of forms, of the one being tested
     * @param field          the field to inject
     * @param testValue      the input containing the injection
     * @param resultsManager evaluates the results of the test
     * @param tabWrapper     contains the tab to run the test in
     * @param tabManager     provides information about the target page
     */
    do_test: function(formPanel, formIndex, field, testData, resultsManager,
            tabWrapper, tabManager)
    {
        var wroteTabData = false;
        var self = this;
        var formData = null;
             
        this.formIndex = formIndex;
        this.fieldIndex = field.index;
        this.field = field;
        this.tabWrapper = tabWrapper
        
        
        if (field) {
            formData = tabManager.getFormDataForURL(formIndex, field.index, 
                    testData.string);
        }
        else {
            formData = tabManager.getFormDataForURL(formIndex, null, testData.string);
        }
        this.testData = tabManager.getTabData(formIndex, field.index, testData.string);
        dump('\ndoing source test...');
        this.do_source_test(formIndex, formIndex, field, testData,
                resultsManager, formData, tabManager);
        
    }
    ,
    do_source_test:function(formPanel, formIndex, field, testData,
                            resultsManager,  formData, tabManager) {
        var streamListener = new StreamListener(this, resultsManager);
        resultsManager.addSourceListener(streamListener);

        // the IO service
        var ioService = Components.classes['@mozilla.org/network/io-service;1']
                .getService(Components.interfaces.nsIIOService);

        
        var form = tabManager.tabForms[formIndex];
        var formAction = form.action;
        var formURL = (form.action.indexOf("?") == -1) ? formAction : formAction.split("?")[0];
                        
        dump('AttackRunner::do_source_test  formAction=== '+formAction+'\n');
        if (form.method.toLowerCase() != 'post'){
            formAction += formAction.indexOf('?') === -1 ? '?' : '&';
            formAction += formData;
            formURL = formAction;
        } 
        
        dump('attackrunner::do_source_test::formAction == ' + formAction + '\n');
        dump('attackrunner::do_source_test::formData == ' + formData + '\n');
        
        var uri = ioService.newURI(formURL, null, null);
        Components.utils.reportError("got a " + uri.toString() + " from a " + formURL)
        
        this.channel = ioService.newChannelFromURI(uri);
        
        
        if (form.method.toLowerCase() == 'post'){
            var inputStream = Components.
                    classes['@mozilla.org/io/string-input-stream;1'].
                    createInstance(Components.interfaces.nsIStringInputStream);
            inputStream.setData(formData, formData.length);
            this.channel.QueryInterface(Components.interfaces.nsIUploadChannel).
                    setUploadStream(inputStream, 
                    'application/x-www-form-urlencoded', -1);
            this.channel.QueryInterface(Components.interfaces.nsIHttpChannel).
                    requestMethod = 'POST';
        }
        
        streamListener.testData = this.testData;
        this.channel.asyncOpen(streamListener, null);
        resultsManager.extensionManager.finishedTest();
    }
}
