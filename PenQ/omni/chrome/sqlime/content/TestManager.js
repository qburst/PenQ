/*
Copyright 2008 Security Compass

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
 * TestManager
 * The TestManager is responsible for making sure that tests are run properly.
 * It does not actually run the tests, just preps them. The TestRunnerContainer
 * is responsible for running the tests.
 */

/**
 * TestManager ctor
 */
function TestManager(){
    
    /**
     * an array of vulnerable fields, used in heuristic testing
     */
    this.vulnerableFields = new Array();
    this.controller = null;
    this.resultsManager = null;
    this.waitingForHeuristicTests = false;
    this.testType = null;
    this.resultsStillExpected = 0;
    
}

TestManager.prototype = {
    /**
     * Runs a test on the passed fields.
     * @param testType           whether to test with all the strings or just with the top strings
     * @param fieldsToTest       the fields to test with this battery
     * @param tabManager         information about the target page
     */
    runTest: function (testType, fieldsToTest, tabManager) {
        
        this.testType = testType;
        
        this.clear();
        
        this.fieldsToTest = fieldsToTest;

        this.tabManager = tabManager;
        
        this.runThoroughTest(testType, fieldsToTest);
    }
    ,
    /**
     * This is a function that AttackRunner requires its resultsmanager to have
     */
    addSourceListener: function(sourceListener, attackRunner) {
        
    }
    ,
    /**
     * called by testRunners to report their results
     * @param browser a browser instance with the results
     * @param 
     */
    evaluate: function(browser, attackRunner) {
        
    }
    ,
    /**
     * called by a streamlistener to report the results of a source test
     * @param streamListener the streamListener that is reporting the results
     */
    evaluateSource: function(streamListener) {
        
        var resultData = streamListener.data;
        var testData = streamListener.attackRunner.testData;
        
        if (resultData.indexOf(testData.string) !== -1) {
            var vulnerableField = streamListener.attackRunner.field;
            var isVulnerablFieldAlreadyLogged = false;
            if (this.vulnerableFields.length > 0) {
                for each (var value in this.vulnerableFields) {
                    var areFormIndexsSame = value.formIndex === vulnerableField.formIndex;
                    if (areFormIndexsSame) {
                        var areFieldsSame = value.index === vulnerableField.index;
                        if (areFieldsSame) {
                            value.vulnerableChars += testData.string[testData.string.length-1];
                            isVulnerablFieldAlreadyLogged = true;
                            break;
                        }
                    }
                }
            }
            
            if (isVulnerablFieldAlreadyLogged === false) {
                streamListener.attackRunner.field.vulnerableChars = testData.string[testData.string.length-1];
                this.vulnerableFields.push(streamListener.attackRunner.field);
            }
            
        }
        
        this.resultsStillExpected--;
    }
    ,
    /**
     * runs non-heuristic tests on the fields.
     * @param testType with all strings or just the top strings.
     */
    runThoroughTest: function(testType, vulnerableFields) {
        
        this.resultsManager = new ResultsManager(this.controller);
        
        this.resultsManager.addSourceEvaluator(checkSrcForErrorString);
        this.resultsManager.addSourceEvaluator(checkForServerResponseCode);
        
        getTestRunnerContainer().clear();
        var testStrings = getAttackStringContainer().getStrings();
        var numberOfTests;
        if (testType.allTests)
            numberOfTests = testStrings.length;
        else {
            numberOfTests = this.controller.getPreferredNumberOfAttacks();
        }
        
        for each (var field in vulnerableFields) {
            
            for (var n = 0; n < numberOfTests && testStrings[n]; n++) {
                
                var testRunner = new AttackRunner();
                this.resultsManager.registerAttack(testRunner);
                
                getTestRunnerContainer().addTestRunner(testRunner, null,
                        field.formIndex, field, testStrings[n],
                        this.resultsManager);
                
            }
            
        }
        
        var self = this;
        
        var testRunnerContainer = getTestRunnerContainer(self);
        
        if (testRunnerContainer.keepChecking === false) {
            testRunnerContainer.keepChecking = true;
        }
        testRunnerContainer.start(this.tabManager); 
        
    }
    ,
    /**
     * this is called by the testRunnerContainer when all tests are definitely
     * complete.
     */
    doneTesting: function() {
        var self = this;
        function checkAgain() {
            self.doneTesting();
        }
        if (this.controller) {
            if (this.resultsManager.allResultsLogged === false){
                dump('\nnot done yet...');
                window.setTimeout(checkAgain, 100);
                //Components.utils.reportError('results not all logged yet');
                return
            }
            dump('\ndone now.')
            getTestRunnerContainer().clearWorkTabs();
            this.controller.generatingReport();
            this.resultsManager.showResults(this);
            
        }
        
    }
    ,
    /**
     * postReport is called after the report is generated
     */
    postReport: function() {
        this.controller.postTest();
    }
    ,
    /**
     * clears the object and makes it ready for use for a new set of tests.
     */
    clear: function() {
        this.resultsManager = null;
        
        this.vulnerableFields.splice(0,this.vulnerableFields.length);
        
    }
    ,
    /**
     * Called when an AttackRunner cannot test because it is in an error state.
     */
    cannotRunTests: function() {
        getTestRunnerContainer().stop();
        getTestRunnerContainer().clearWorkTabs();
        
        var resultsManager = null;
        if (this.resultsManager) {
            resultsManager = this.resultsManager;
        }
        else {
            resultsManager = new ResultsManager(this.controller);
        }
        resultsManager.showResults(this, "There was an error while testing this site. This was likely due to <a href='https://bugzilla.mozilla.org/show_bug.cgi?id=420025'>Mozilla bug 420025</a> which only affects Fx2. We're working on making SQL Inject Me work with FireFox 3. Please help us track this bug by either <a href='mailto:bugs@securitycompass.com?subject=Triggered bug 420025'>emailing us</a> the url to this site or commenting on <a href='https://bugzilla.mozilla.org/show_bug.cgi?id=420025'>the bug</a>. We apologize for the inconvenience.");
        this.controller.postTest();
        
        Components.utils.reportError(
                'The loading of this page in a work tab as not successful: ' +
                getMainHTMLDoc().documentURI);
    }
}

/**
 * The getInstance method for the TestManager singleton
 */
function getTestManager(controller) {
    if (typeof(xssme__testmanager__) == 'undefined' ||
        !xssme__testmanager__)
    {
        xssme__testmanager__  = new TestManager();
    }
    // @todo: there has to be a better way...
    if (controller) {
        xssme__testmanager__.controller = controller;
    }
    
    return xssme__testmanager__;
}

