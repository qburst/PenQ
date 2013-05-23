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
 * TestRunnerContainer.js
 */

/**
 * Based around a poor man's semaphore concept.
 */
function TestRunnerContainer() {
    this.testRunners = new Array(); //All these arrays are parallell
    this.formPanels = new Array();
    this.formIndexes = new Array();
    this.fields = new Array();
    this.testValues = new Array();
    this.resultsManagers = new Array();
    this.testManager = null;
    this.keepChecking = true;
}

TestRunnerContainer.prototype = {
    addTestRunner: function(testRunner, formPanel, formIndex, field, 
            testValue, resultsManager)
    {
        this.testRunners.push(testRunner);
        this.formPanels.push(formPanel);
        this.formIndexes.push(formIndex);
        this.fields.push(field);
        this.testValues.push(testValue);
        this.resultsManagers.push(resultsManager);
    }
    ,
    /* Called to begin a new test battery in this container.
     * @param tabManager information about the target of this battery
     */
    start: function (tabManager) {
        // Has another part of the program halted the testing?
        if (!this.keepChecking) return;

        // Do we have any more tests to run?
        if (!this.testRunners.length) {
            this.keepChecking = false;
            this.testManager.doneTesting();
            return;
        }

        // Begin the next test in the first available tab and move that tab to the back of the queue.
        for (var i = 0; i < this.tabWrappers.length; i++) {
            if (!this.tabWrappers[i].inUse) {
                this.tabWrappers[i].inUse = true;
                this.testRunners.pop().do_test(this.formPanels.pop(),
                                               this.formIndexes.pop(),
                                               this.fields.pop(),
                                               this.testValues.pop(), 
                                               this.resultsManagers.pop(),
                                               this.tabWrappers[i],
                                               tabManager);
                this.tabWrappers.push(this.tabWrappers.splice(i, 1)[0]);
                break;
            }
        }

        var self = this;
        setTimeout(function() { self.start(tabManager); }, 1);
    }
    ,
    numWorkTabs: 6
    ,
    getNumWorkTabs: function(){
        var prefService = Components.classes['@mozilla.org/preferences-service;1'].
                getService(Components.interfaces.nsIPrefService);
        var branch = prefService.getBranch('extensions.xssme.');
        if (branch.prefHasUserValue('numtabstouse') ){
            return branch.getIntPref('numtabstouse');
        }
        else {
            return this.numWorkTabs;
        }
    }
    ,
    clear: function (){
        this.testRunners.splice(0, this.testRunners.length);
        this.formPanels.splice(0, this.formPanels.length);
        this.formIndexes.splice(0, this.formPanels.length);
        this.fields.splice(0, this.formPanels.length);
        this.testValues.splice(0, this.formPanels.length);
        this.resultsManagers.splice(0, this.formPanels.length);
        //if (this.tabWrappers)
        //    this.tabWrappers.splice(0, this.tabWrappers.length);
    }
    ,
    /**
     * Creates the tabs whose browsers will be used to run individual tests.
     * @param testManager will be reported to when test battery is complete.
     */
    setup: function(testManager) {
        this.testManager = testManager;
        this.tabWrappers = new Array();
        for (var i = 0; i < this.getNumWorkTabs(); i++) {
            this.tabWrappers[i] = {
              inUse: false,
              tab: getMainWindow().document.getElementById('content').addTab('about:blank')
            };
        }
    }
    ,
    clearWorkTabs: function () {
        for (var i = 0; i < this.tabWrappers.length; i++)
          getMainWindow().gBrowser.removeTab(this.tabWrappers[i].tab);
    }
    ,
    /**
     * Stops the running of tests in the TestRunnerContainer.
     */
    stop: function(){
        this.keepChecking = false;
        this.clear();
    }
};

/**
 * If currentNumTabs is provided, the container is cleared.
 */
function getTestRunnerContainer(currentNumTabs, testManager){
    
    if (typeof(xssme__testrunnercontainer__) == 'undefined' || 
            !xssme__testrunnercontainer__ )
    {
        xssme__testrunnercontainer__ = new TestRunnerContainer();
    }
    
    if (currentNumTabs && testManager) {
        xssme__testrunnercontainer__.setup(testManager);
 
    }
    
    return xssme__testrunnercontainer__;
    
}