/*
Copyright 2007 Security Compass

This file is part of XSS Me.

XSS Me is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

XSS Me is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with XSS Me.  If not, see <http://www.gnu.org/licenses/>.

If you have any questions regarding XSS Me please contact
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
    do_test: function(formPanel, formIndex, field, testValue, resultsManager,
            tabWrapper, tabManager)
    {
        var wroteTabData = false;
        var self = this; //make sure we always have a reference to this object
        var browser = tabWrapper.tab.linkedBrowser;
             
        this.testValue = testValue;
        this.formIndex = formIndex;
        this.fieldIndex = field.index;
        this.field = field;
        browser.webNavigation.stop(Components.interfaces.nsIWebNavigation.STOP_ALL);

        setTimeout(function() {afterWorkTabStopped()}, 10);
        
        function afterWorkTabStopped(){
            browser.addEventListener('pageshow',
                    afterWorkTabHasLoaded, false);
            tabManager.loadTargetPage(browser);
        }
        
        function afterWorkTabHasLoaded(event) {
            
            var formData = null;
            browser.removeEventListener('pageshow', 
                    afterWorkTabHasLoaded, false);
            
            var loadSuccessful = compareContentDocuments(tabManager.targetContentDocument, browser.contentDocument)
            
            if (loadSuccessful === false) {
                getTestManager().cannotRunTests();
                return;
            }

            //this will copy all the form data...
            try { 
                if (field)
                {
                    tabManager.writeTabForms(browser.contentDocument.
                            forms,  formIndex, field.index, testValue);
                    formData = tabManager.getFormDataForURL(browser.
                            contentDocument.forms,  formIndex, field.index, 
                            testValue);
                }
                else 
                {
                    tabManager.writeTabForms(browser.contentDocument.
                            forms,  formIndex, null, null);
                    formData = tabManager.getFormDataForURL(browser.
                            contentDocument.forms,  formIndex, null, null);
                }
            }
            catch(e) {
                Components.utils.reportError(e + " " + (browser.webNavigation.currentURI?browser.webNavigation.currentURI.spec:"null"))
            }
            dump('AttackRunner::afterWorkTabHasLoaded  testValue===' + testValue + '\n');


            self.testData = tabManager.getTabData(browser.
                    contentDocument.forms,  formIndex, field.index);
            
            self.do_source_test(formPanel, formIndex, field, testValue, 
                    resultsManager, browser, 
                    formData);
                    
            //if (window.navigator.platform.match("win", "i")) {
                browser.addEventListener('pageshow', 
                        afterWorkTabHasSubmittedAndLoaded, false);
            //}
            //else {
            //    setTimeout(function(){browser.addEventListener('pageshow', 
            //            afterWorkTabHasSubmittedAndLoaded, false)}, 0);
            //}
            

            var formGotSubmitted = self.submitForm(browser, formIndex);

        }
        
        //this should fire only *after* the form has been sumbitted and the new
        //page has loaded.
        function afterWorkTabHasSubmittedAndLoaded(event){
            
            browser.removeEventListener('pageshow', afterWorkTabHasSubmittedAndLoaded, false);
            var results = resultsManager.evaluate(event.currentTarget, self);
            /* @todo this should be moved to resultsmanager */
            for each (result in results){
                tabManager.addFieldData(result);
            }
            tabWrapper.inUse = false;
                

        }
        
        
        
    }
    ,
    do_source_test:function(formPanel, formIndex, field, testValue,
            resultsManager, browser, formData)
    {
        // the IO service
        var ioService = Components.classes['@mozilla.org/network/io-service;1']
                .getService(Components.interfaces.nsIIOService);
        var formURL = browser.contentDocument.URL;
        var form = browser.contentDocument.forms[formIndex];
        var formAction = form.action ? form.action : browser.contentDocument.
                location.toString();
                
        dump('AttackRunner::do_source_test  formAction=== '+formAction+'\n');
        if (form.method.toLowerCase() != 'post'){
            formAction += formAction.indexOf('?') === -1 ? '?' : '&';
            formAction += formData;
        } 
        
        dump('attackrunner::do_source_test::formAction == ' + formAction + '\n');
        dump('attackrunner::do_source_test::formData == ' + formData + '\n');
        
        var uri = ioService.newURI(formAction, null, null);
        var referingURI = ioService.newURI(formURL, null, null);
        var channel = ioService.newChannelFromURI(uri);
        channel.QueryInterface(Components.interfaces.nsIHttpChannel).
                referrer = referingURI;
        
        if (form.method.toLowerCase() == 'post'){
            var inputStream = Components.
                    classes['@mozilla.org/io/string-input-stream;1'].
                    createInstance(Components.interfaces.nsIStringInputStream);
            inputStream.setData(formData, formData.length);
            channel.QueryInterface(Components.interfaces.nsIUploadChannel).
                    setUploadStream(inputStream, 
                    'application/x-www-form-urlencoded', -1);
            channel.QueryInterface(Components.interfaces.nsIHttpChannel).
                    requestMethod = 'POST';
        }
        
        var streamListener = new StreamListener(this, resultsManager);
        streamListener.testData = this.testData;
        resultsManager.addSourceListener(streamListener);
        
        channel.asyncOpen(streamListener, null);

    }
    
}
