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
 * ResultsManager.js
 * @requires FieldResult.js
 * @requires Result.js
 * @requires AttackHttpResponseObserver
 */

/**
 * The Results Manager is 
 */
function ResultsManager(extensionManager) {
    this.evaluators = new Array();
    this.errors = 0
    this.warnings = 0
    this.pass = 0
    this.attacks = new Array();
    this.httpresponseObservers = new Array(); //parallel to this.attacks
    this.sourceListeners = new Array(); //members are asynchronous.
    this.sourceEvaluators = new Array();
    this.extensionManager = extensionManager;
    this.allResultsLogged = false;
    this.testPageURL = getMainWindow().document.getElementById('content').webNavigation.currentURI.spec;
    this.results = "";
    
    /**
     *  This is a dynamically allocated 2d array. The first dimension is the
     *  index of the form. The second dimension is the index of the field that
     *  is being tested
     */
    this.fields = new Array(); 

}

ResultsManager.prototype = {
    addResults: function(resultsWrapper){
        if (resultsWrapper.results.length === 0) {
            return;
        }
        var field = resultsWrapper.field;
        /* if there is no field array for this form then create it*/
        if (this.fields[field.formIndex] === undefined){
            this.fields[field.formIndex] = new Array(); 
        }
        
        if (this.fields[field.formIndex][field.index] === undefined) {
            this.fields[field.formIndex][field.index] = new FieldResult(field);
        }
        this.fields[field.formIndex][field.index].addResults(resultsWrapper.results);
        if (this.sourceListeners.length === 0 && getTestRunnerContainer().testRunners.length === 0) {
            dump('\nall results logged now.')
            this.allResultsLogged = true;
        }
    }
    ,
    evaluate: function(browser, attackRunner){
        
        this.attacks.splice(this.attacks.indexOf(attackRunner), 1);
        
        for each (var evaluator in this.evaluators){
            
            var results = evaluator(browser);
            
            dump('resultsManager::evaluate attackRunner::testData'+attackRunner.testData.length+'\n');
            for each(var result in results){
                result.testData = attackRunner.testData;
                result.fieldIndex = attackRunner.fieldIndex;
                result.formIndex = attackRunner.formIndex;
            }
            var resultsWrapper = new Object();
            resultsWrapper.results = results;
            resultsWrapper.field = attackRunner.field;
            
            this.addResults(resultsWrapper);
            
        }
        
    }
    ,  
    addEvaluator: function(evaluator){
        this.evaluators.push(evaluator);
    }
    ,
    hasResults: function(){
        return (this.errors.length !==  0 || 
                this.warnings.length !== 0 || 
                this.pass.length !== 0);
    }
    ,
    getNumTestsRun: function(){
        var results = [this.errors, this.warnings , this.pass];
        var rv = 0;
        
        for each (var resultContainer in results){
            for each (var resultLevel in resultContainer){
                for each (var result in resultLevel){
                    if (result !== null && result !== undefined){
                        rv++;
                    }
                }
            }
        }
        
        return rv;
        
    }
    ,
    getNumTestsPassed: function(){
        var rv = 0;
        for each (var resultLevel in this.pass){
            for each (var result in resultLevel){
                if (result !== null && result !== undefined){
                    rv++;
                }
            }
        }
        return rv;
    }
    ,
    getNumTestsWarned: function(){
        var rv = 0;
        for each (var resultLevel in this.warnings){
            for each (var result in resultLevel){
                if (result !== null && result !== undefined){
                    rv++;
                }
            }
        }
        return rv;
    }
    ,
    getNumTestsFailed: function(){
        var rv = 0;
        for each (var resultLevel in this.errors){
            for each (var result in resultLevel){
                if (result !== null && result !== undefined){
                    rv++;
                }
            }
        }
        return rv;
    }
    ,
    makeResultsGraph: function (numTestsRun, numFailed, numWarned, numPassed){
        var rv = '';
        var errorCSSClass = 'fail';
        
        // if no tests were run then all the othe args are zero too. This
        // makes the bars be zero and the number errors (normally white) black
        if (numTestsRun === 0) {
            errorCSSClass = 'zero';
            numTestsRun = 1;
        }
        else if (numFailed === 0) {
            errorCSSClass = 'zero';
        }
        
        rv += '<table style="width: 100%">';
        rv += '<tbody><tr>';
        rv += "<td nowrap='nowrap'>Failures:</td>";
        rv += '<td class="bar"><div style="width: ' +
                Math.round((numFailed / numTestsRun)*100).toString() +
                '% ;" class="'+errorCSSClass+'">' +
                numFailed + '</div></td>';
        rv += '</tr><tr>';
        rv +="<td nowrap='nowrap'>Warnings:</td>";
        rv += '<td class="bar"><div style="width: ' +
                Math.round((numWarned / numTestsRun)*100).toString() + 
                '%;" class="warn">'+numWarned+'</div></td>';
        rv += '</tr><tr>';
        rv += "<td>Passes:</td>" +
                '<td class="bar"><div style="width: ' +
                Math.round((numPassed / numTestsRun)*100).toString() + 
                '%;" class="pass">'+numPassed+'</div></td>';
        rv +='</tr></body></table>';
        
        return rv;
    }
    ,
    sortResults: function (){
        var errors = new Array();
        var errorsWithWarnings = new Array();
        var errorsWithWarningsAndPasses = new Array();
        var warnings = new Array();
        var warningsWithPasses = new Array();
        var passes = new Array();
        for each (var form in this.fields){
            for each(var fieldResult in form) {
                if (fieldResult.state & fieldresult_has_error &&
                    !(fieldResult.state & fieldresult_has_warn ||
                      fieldResult.state & fieldresult_has_pass))
                {
                    errors.push(fieldResult);
                }
                else if (fieldResult.state & fieldresult_has_error &&
                         fieldResult.state & fieldresult_has_warn &&
                         !(fieldResult.state & fieldresult_has_pass))
                {
                    errorsWithWarnings.push(fieldResult);
                }
                else if (fieldResult.state & fieldresult_has_error &&
                         fieldResult.state & fieldresult_has_warn &&
                         fieldResult.state & fieldresult_has_pass)
                {
                    errorsWithWarningsAndPasses.push(fieldResult);
                }
                else if (fieldResult.state & fieldresult_has_warn &&
                         !(fieldResult.state & fieldresult_has_pass))
                {
                    warnings.push(fieldResult);
                }
                else if (fieldResult.state & fieldresult_has_warn &&
                         fieldResult.state & fieldresult_has_pass)
                {
                    warningsWithPasses.push(fieldResult);
                }
                else {
                    passes.push(fieldResult);
                }
            }
        }
        
        return errors.concat(errorsWithWarnings, errorsWithWarningsAndPasses,
                warnings, warningsWithPasses, passes);
        
    }
    ,
    count: function(){
        var numTestsRun = 0; 
        var numPasses = 0; 
        var numWarnings = 0;
        var numFailes = 0; 
        for each (var form in this.fields) {
            for each (var fieldResult in form) {
                var numTestsRunInField = 0; 
                var numPassesInField = 0; 
                var numWarningsInField = 0;
                var numFailesInField = 0; 
                [numTestsRunInField, numFailesInField, numWarningsInField, numPassesInField] =
                        fieldResult.getLength();
                        
                numTestsRun += numTestsRunInField; 
                numPasses += numPassesInField; 
                numWarnings += numWarningsInField;
                numFailes += numFailesInField; 
                        
            }
        }
        return [numTestsRun, numFailes, numWarnings, numPasses];
    }
    ,
    /**
     * returns a string with the (html formatted) results for a given field
     * @param fieldResult the fieldResult for a given page
     * @param showPass whether to show pass results
     */
    showFieldResult: function(fieldResult, showPass){
        fieldResult.sort();
        var rv ="";
        var testFieldName;
        rv += "<div class='result'>";
        var unamedFieldCounter = 0;
        var testDataList = fieldResult.getSubmitState();
        var testedDataKey = null;
        var stringEncoder = getHTMLStringEncoder();
        var passCount = 0;
        for each(var testData in testDataList) {
            if (testData.tested ===true){
                testFieldName = (testData.name !== undefined ? testData.name : "unnamed field");
                break;
            }
        }
        rv += "<div class='field'>" + (testFieldName?testFieldName:'unnamed field') + "</div>";
        rv += "<div class='submitted'>";
        rv += "<b>Submitted Form State:</b><br /><ul>";
        for (var key in testDataList) {
            if (testDataList[key].tested === false){
                rv += "<li>" + (testDataList[Number(key)].name ? testDataList[Number(key)].name : "unnamed field") + ": " + testDataList[Number(key)].data+ "</li>";
            }
            else {
                testedDataKey = key;
            }
        }
        rv += "</ul></div>";
        rv += "<div class='outcome'><b>Results:</b><br />";
        for each(var result in fieldResult.results) {
            switch (result.type){
                case RESULT_TYPE_PASS:
                    if (showPass === false) {
                        passCount++;
                        continue; /* ugly, I know. But keeps this check being
                                    done only when it has to be. valuable since
                                    we're dealing with big values of N */
                    }
                    rv += "<div class='pass'>"
                    break;
                case RESULT_TYPE_WARNING:
                    rv += "<div class='warn'>"
                    break;
                case RESULT_TYPE_ERROR:
                    rv += "<div class='fail'>";
                    break;
            }
            rv += result.message+"<br />"
            rv += "Tested value: ";
            unamedFieldCounter = 0;
            if (testedDataKey) {
                rv += stringEncoder.encodeString(result.testData[testedDataKey].data);
            }
            else {
                for each(var testData in result.testData) {
                    if (testData.tested === true){
                        rv += stringEncoder.encodeString(testData.data);
                        break;
                    }
                    else if (testData.name === undefined ) {
                        unamedFieldCounter++;
                    }
                }
            }
            rv += "</div>"
            
        }
        if (showPass === false && passCount > 0) {
            rv += "<div class='pass'>";
            rv += "This field passed " + passCount +
                    " tests. To see all the passed results, go to Tools->SQL Inject Me->Options and click 'Show passed results in final report' and rerun this test."
            rv += "</div>";
        }
        rv += '</div>';
        rv += "</div>";
        return rv;
    }
    ,
    /**
     * Generates and displays a report of the gathered results.
     * @param testManager a reference to the test manager
     * @param errorstr {string} a string with an error message (optional)
     */
    showResults: function(testManager, errorstr){
        this.generateTopOfReport(testManager, errorstr);
    }
    ,
    registerAttack:function(attackRunner){
        this.attacks.push(attackRunner);
    }
    ,
    /**
     * Generates the top part of the reprot (header, charts, etc.). Everything
     * before the body
     */
    generateTopOfReport: function(testManager, errorstr) {
         if (this.sourceListeners.length != 0 && errorstr === undefined){
            //there may be no more tests to start but there are still some
            //to finish. Wait until they're all done.
            var self = this;
            dump('doing the resultsmanager wait...' + this.sourceListeners.length);
            setTimeout(function(){self.showResults(testManager)}, 1000);
            return;
        }
        
        var sortedResults = this.sortResults();
        
        var resultsTab = null;
        var numTestsRun = 0; 
        var numPasses = 0; 
        var numWarnings = 0;
        var numFailes = 0;
        
        var prefService = Components.classes['@mozilla.org/preferences-service;1'].
            getService(Components.interfaces.nsIPrefService);
        var branch = prefService.getBranch('extensions.sqlime.reportbuilding.')
        
        this.showPasses = branch.getBoolPref('showPass');
        
        [numTestsRun, numFailes, numWarnings, numPasses] = this.count();
        
        this.results= this.header();
        this.results += "<div class='header'>"
        this.results+= "<div class='logo'><a href='http://www.securitycompass.com' target='securitycompasssite'><img alt='Security Compass Logo' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAABoCAYAAADYQu11AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH1wkcES8RsXjduQAAIABJREFUeNrtnXd4VMX6xz9nd9M7SUgjhBASAoEUSugldJCuUgRBxIuiCCj2dr3KBSv6ExXBghdEUYoUUXrX0GtCCRBKgAAhvWfL+f2xm2V3cxIC0oLzfZ59spkzZ07Z+b5tZt4BAQEBAQEBAQEBAQEBAQGBewGS+UuTh/sDA8QrERC4b5AvJy2aDKCxKGwGPC7ejYDAfYMMYDKAyqJQFu9FQOD+hErJjBcQELh/iS4gICCILiAgcD8QXfjoAgLCRxcQEBCm+22GBDw3sg8DOzcXv5qAwP1quj//6AN8+OJofvzoefp3iBO/nIDA/Wa6Txjag7efHYZOr0elkpj73rP079hM/HoCAtWEpibc5He/bmLusk10bdUEd1cXft2wE4MsYocCAjdD9HuWOUVlWgBKtTpKdToKS7XilxMQuN9MdwEBgVtHdGELCwgIjS4gIHA/EF1AQECY7gICAsJ0FxAQEKb7LYGwOQQEbgr3/ji6LKNWSbg6OeLh6iS4LiDwN4l+z5ju7k4OdGjeiC6tmtCyaTgN6vrj4eaCRqNm5Mv/J341AYG/QfS7jqb16/DMI714sGcbvD3dxK8jIPD3Id0zpnuInzf/nTycIb3aodGozTeTmZ3HzoMpHE45x/lLmWTm5rPjYMo9/2ZVkkTHFo3p17k5jerXwcFeg0GWuZKZy5HU82zdc5QdB1PQ6vQ1ugc91KM1LaLCOJd+lS8XrrnWsyTJ5HUJR+teJLp05wkBTwzqwgcvjsLd1RmAgsJiFq7azvyVW9lxKAWt3gBSzRkQCKxdi3nTJpAQH1VlvcuZuQx89gN2JZ2ssT2oV7tYxgxKYOehE2aixzdtwLzpz3LyXDp9n35P0OweJPodhbODHV+9+S9G9O+EJEmUlmmZ9dNqPvhuOZey8ixus+aQ3N3ViXVfv0FkaBC5+UV8vWQDm3cnk19YjJODPZH1g+jeOpqubZri5+1BQG2vGt2DdiWdxNnRgRPn0s1lTg72hNf1R6vVCYrdoz76HbOz3J0d+fWzl0ho1QSAA0dPM/aNL9mfcrZGv8xxD3cnMjSIvIIiOox+i+STaVbH1yUeYuaCPwgJ9OXtp4dgMNRs03bOovXMWbResKiGEf2OqE4nezuWfvqCmeQ/r9rGuP/MIb+4tPKTTENsarUaZNAbDOgN955J375ZJAC/bztQgeSWOHsxgzFvfIGDXUWDysXJgYFd4mkV3QBXZ0eKSsrYdfgkS9fvpKCoRLG9hvUC6dU+lnpBtQE4l36V9TsOkXwyDYNBpo6/N+F1/bmcmcuRU+crnO9gb0fb2Ah0egN/7T9ufLdgdj+27zuOVqfD0cGe6Ii6uDg5kJGdR15BMWHBfly6msPR1AtEhQUT1yjU/ByVuS8pZ9K5cCVLuUNq1HQwvce9yankFRYLlv59013W3Okrznztcbq0iQZg9s9reHbaXHSmjmWLIB9PxgxKwNfTjUC/WjQICSAzKw+NvR1bdxzGIEl89+tGzl3OujekpkplMl/tqlW/1Ma8TYiPYu7UZwj297YqHz+0B/8e/xBDpnzC3iOp14Smoz2fvDSaMQMTzEFMS/Ns9+GTtBnxOg92a8WMl0bz4+/befSVmRXuw9vTjfXfvEVOfhF1uz1FoUnorv/mLQDqdH2KYb3b8uKYAfh5ewBw8PgZfly1nfefH8n/lm/h8Te/5PUnBzO0V1sAQgJ9zeeX4/T5K4TWqc0vaxIZ/uKniu+kb6fmLPlkClcycwl/YKKgaU003Uf368iYwV0AWLT6LyZM+w69gvnatH4Qw3q1ZsKo/pSUlrF6814e7NmW02mXKS3VEh8TQVFhMXUDfZkypj/zlqzl2+Xb2Hf87pr+R06dp3eHOHq2i6Vbm2jWJx6q9rmto8P57YtXsbfX8PWSDcxfsYWr2fkE1a7FC2P607NdDEs+fYHYB18kJ78QlUpiwfsTGZDQkqKSUr5YuIbt+46hVqloFd2AEX07EN+0QcWozE1gxecv06xRKKVlOs5ezEBSSZSVVfTB1/x5AHuNhkHd4snKLWDBqm1Wx/cfPc2374ynf+cWBPt7k3Yp0/r+JImnh/YA4Ltlmyq1YARuGHdOowf5ePLhS6ORJInkE+cY++aXFUhup1YxrGdbark7U8fPl5Xrd7Jxx2E6xUfx4/LNJnOxiJNnLgKwZE0iHVs2xs3NjY5xkcREhPDj6r8qaMo75rMuXs+4Id1xc3bk91mvsifpFFv2HOHg8TMcSjnH6QtXKC4pUzRXv3jjCRwd7Hhz5s9M+3qp+djxMxfZvv8Yf/4wlWaNQnm0f0dmLviDh3u0YUBCS4pLy+j91DS27ztmPmfR2kTenb2EdyYMraDlr9MfFEvD6/rz1uc/M3vROrJzC0ECjVrNs4/0sqr3v+VbOHMhg0Hd4rl0NYfJ731vdVylknh+dD+aNAjmsYEJvPvVYqvjkaGBdI6PQqvV8c3iDYKet9CYvjM+uizz9tND8PZ0o0yrY+wbX1Jg0+EdNBrmTXuGoqIShvXriIO9HcdOpeHv60WXtjEApKZd5mpWLvExEQDExzbk1Nl0enZsxtC+HViwbDMDusYz8pWZFJSU3vG3efLcJQZP+pDv3n2aYH9vWkWH0yo6vPwVkJNfyK7DJ5m/ciuL1+5AqzMKpJZRYcRG1iM9I5sPv19Rod0yrY75K7bSrFEoXVs1YeaCP3jiwa4A/LByqxXJy5GbX8Sk6XNvwrmqiG7/epc9SaesyvR6ww2/H4NBZs6idXz26uOMHZzAB98usxLK4x7ujlqlYsWmPZy+cEXQs6aZ7g3q+DFyQCcAvl+6gV3JqVZ9Si1JfPOfJ3G0t6Nds0gc7I0+7rbdR3jCZMopthsSwCaTeWyn0dCrU3N2HUxh3vQJDJnySaW+/+3Exp1JNBn4PIO7taJH2xiaR9UnJNAXezsNXu4u9GwXQ892MTz5cDcGTvqQnLxC2sY2BCAzt4AxAzortts4rA5gHKeXJMksQH7bsu+2P9PZixl/V1aY8eOq7bzzzFCC/X3o07EZv27YBYCHqzMjHmgPwBc/rRHMvI1Ev214cmh3HOztKCopZfrXyyp0hqeH9mBQj9YsXf0XgX7GQFRxSSkuzo7mWVaVISI0kFPn0gmrG4C/rxfFJWX06BjHC6P78t7cFXflpRYUlTBvxRbmrdgCgJuzI+H1Amgb25DRAzrTrFEoHZo3YtrE4Tw99RsCfD0BaNIgmFlv/atqHkng6uyIi5MDQAU/9+57g1Ufzs4r5Kc//mT80B6MH9bTTPShvdri7elG8qnzbN6dLJh5G4l+W0x3O5XEyP5Gbb5s3U7OXrpqNSzm5uRA1/go3p+9hBZNwths0tBHU8/j4uRg/h8gPSOb3PxCiiyCNCVlWn5YtplOLY1DOc6O9sz8fiUdmzfiq5/XknMPBHTyi0rYd+Q0+46c5quf17FoxvP0T2hB/y4tmfjeNfP6rwPH+c+sRVW3VVBcgfjVV7b3xnDk7EXrGPdwN7rERxEZGkTK2XSeHNIdgM9//ENMna2JGr11TAR+3kaNteC3bRV65uvjBtO8aTgpZ9Np3iTcXH4o5Szd2lnvyOLo5EBWdj4R9etYlZ84e9Gq7PiZizSNrMfUScOZcMN+6u2FTq/n1w276J/QAg8XJzRqFRnZ+cbnc7BnfeLh6xNWkigpLcPRwZ5gf28OHDtTrWu7Ojvesee0t9OgkiTF/PtJJ9LYvu8YnVo05qmh3VmydicxDUPIyi1g4R9/CVbeBtz2VFJd440TY3LyCtm+3zpo5ObkwNgHu6FWq4ioF0igXy3zx9Pdxer/QL9a1Pb2xKeWe4VyT3dXq/+bhNdFrzcwamAC3u4ud+xldolvgkp1fa3pZbqnrNwCdDoDiQePAxDbsJ7ZF686timz2xQce6AaO9aUk62Wh+vNuNU3Fc+zt9NU6nbJssyshWsBGPFAB6Y81hdJkpi3Ygt5BUWClbeZ6LfFrmsWVd+ooY+fId/GjG7fLBJvLzcOHT1NXFSYuVyvN6BRq6t9DXcXJ3ItOkhsVH32H0nF1dmRrqYZeHcCM14azfKZL9M8qn6lnTw8JIDnRvUFYPG6Hej0ehIPpHD4xDnjdlNTn8bXy11Ri3duGcVjA43BunL//9H+nUiIr/iMtTxcmfP2k4BxogpAXKN6BNWuZVXPx9ONqROH3TJZn5lTAECArxeBVczlX7l5D+cvZ1LLw5V+nVug1en5Wgyp1UzTXQVEhAaZiH62gtneLsYYbb6UmUuXdtc6YFFJKU4O9tW+TpC/DxfSr+IRXtfUed3JyTV2uDaxDfll3c478zYl6NMhjj4d4jhw/AwbdiRx5GQaxWVluLs40To6god6tMbV2ZETZ9OZOnsJAFqdnnFvz2b9N2/RIiqMg0s/Yv7KrRxOOYvBINMgxJ++nZrTvHF9Pvp+JQDzV25lRN8OdG4ZxW9fvMz3yzfz1/4U1GoVLZuEmYNb496ezba9R7manYePlztr5rzON0s2UlRSSmzDegzt1RYPs9Xz92X98dMXSbuUSbC/N4tmTGH2L+so1WqJjazH14s3cOJsujm2MvfXTbz51EMArE88xLHTFwQj7wDRb7nprlGrqW2aMqk0tzksxN/ot+p0aNTXjIui4lIcqjmNFMDLw4WLFtNgNRo1KlN7ESGBxkHsOzAv/uvFG5gwvBcR9QKIbViP2Ib1KtTRGwwsWruDidO+Izuv0Fy+6/BJEsa8zay3/kXzxvV54bF+Fc49fzmTfaYpsFqdnkGTPuKL18cytFdbnhrSg6eG9LCyispn5uUWFDH+3W+YN30CjerX4eMXR12Lb5y7xMTpc5k3fcIteQdanY5npn7Dwo8m07JJGC2bXLPUFq1JtKr7vxVbzEQXQ2q3FfJtjbprNCrzwg1fTzcSmjeyOp6TU8C2XcmcPn+ZbbuTzaLmUmYOZ85fxs3Zyap++tVscvIKKLXZe+1yVg5p6VetRNXRU+fZtiuZjKvZdG7eSNGUlmWZPw+a1rzfAnzx02pm/7KORmFBtI+LJKJeILU8XJGAklItx85c4I9t+zl2+qJiZHnvkVTajHidFlFhtImJMM8rv5KVy85DJ9ibnGo1wSSvoIhRr33Ou7MX07VVU4IDfECWOZt+lQ07DnMq7bK57tL1OzmaeoERfdtT19+H4tIytu49ytJ1xg0rr2TlotPrKbF4t72e/K9RUOQr+82L1+7g4PGzXMzItipftXUf0YNeYECXlvh5e1Cm1XHi3CWOplpr7A7NjP3h2OkLrN9xSNDxNtqat9V01+r0jH39c9SmxR6BpvHicvuhQb0AIsPqcPD4aSItouZubk5odXoibQJTTk72ZGY7K5Q7gIy5XAaSTpwlMqwOarVEkK+XlRhrGxfJ+Ed6U6bVEdjpCbLyb10ASKfXczjlHIdTzt3U+Xq9gZ2HTrDz0InqiWpZJuVMOiln0q9b92jqed74bKHisXUK8/LXXWeu/pmLGZypZDLN6QtX+HT+qkrPVatUTBzRGzAud63p2XZqEtFvuemu1RtYuLZy/zihdVO6to3Bw80FX5P2AlCrVaRdzLAqA+N4tMEgVyi/mpNPSFBtc7lBlnEztblpVxILbExGTzdj9NlgMKDVig52N9CxRWPiGoWSX1jM/JVbxQu5zbirGzgcPmHUei6ODualkWAcT9bdgDmdk1doNXRUWlqGnclHP6yQzKI8s0t2XiGFxWKF1N3Ac6MeAIxzK7JMgVOB2+ej39UNHDbtSsZgMBAWEkBK6nkLotvd0KKJzOw8/HyvDeWcuZBBaB0/ADbvSra1dYkKDwYgNe0ShvtwEpadRo2Xuwte7i7Y22nuufsLDapN0/C6pGdkWyWVFLh9uKtZYJNPnSfpxDka1q/DktV/msfSVSrVDdkXZVqd1ayvg0dSGdC9NSfOprMr2XrVlUatIj7auPptb9IpY4bK+wDOTg6MeKADD/doTWxkPZwc7QFjLr7jZy6yPvEQP67aznHTEt+7ibMXM4gwJZUQvvmdJ/odh16WeeXjHxjdvxOJB46jUavM0mb/0dPodQZkC/mTkZVHfkERqWmXrPyNfUdPU6a9Fi3+c99RJAl+WZNYIaLeonF9/H08TRZF0n3xI8Y3bcC8aRMIDwkwk6dMqwNk3FwcaR0dTuvocF4eO5CPv1/J65/9dFfv1yDLGATB7xrR74pq27Q7mamThhMa7IersyONTZNefGt50DquIS5O1zS17Xr08k7j4uxE3y4tATh++gIhQbWp5eHGmLe+qnC94X3aI0kSOXmFbN5ztMb/gC2bhLF69ut4uDpzOTOXqbOXsGzjbtIzspGAwNpeJMQ34enhPYlv0oBG9YNEr/8H4q5vm1yq0/P4G1/SOLwuOw4cN48vxzauz57D1895npZ+lQC/Wib3WyZx31FiIkMZ89rnlNhkmvFycWLUwAQAlm/YRW5BzU486ORoz//+OwEPV2dOnrtEy6Gv8OXCNVy8koUsyxhkmfOXs5i/cittR7zB2DdnkS+SLQqNfrdu4tDJNMa8OpOpk4azZus+enVqjrenG1cyc6977t6kkwzo2gqAddsPEB/TkPH/mc0OG98c4LlRffFwc0avN/DFT6tr/EbRQ3u1pWFoIDq9gUdfnVlpZtVyIfj98s0sXP3ntR9ckujWuinjHu5O88ahONjbkZmTz4Ydh/n0h98rJJx4blRf/Lw9mLNoPZJk/L9H22hcnBw5m36Vr35ey/yVW5FlmUb16zD50T50bhmFq7MjV7Jymb9yK58t+AOdhdk+oEtL2sREsH7HIQ4cO8uE4T3pn2CcaJNfWMzv2/Yz/etfyci+lus/0NeLiSP7EBtZj7BgP5wdHZCRuZKZx67DJ5j181oO2uQPtLfTMKx3O4b2bktUWDB2GjV5hcUknTjH2r8OsmjNDnLyjTMV3VycGDu4CwO7tCQs2A+VSkVmTj77j53m9637Wb5xNyVl2prUVaR7ZjfVJRt3YzDIDH+gPYn7jhHbOBR3V2dOnL1IHVMyipLSMkpLyyg2pYkqKi6lrExHmVZLUvI58gqKmDZ7CT+urrjUMaKOH5NN00p/27yHvUdP13gpPax3O3OsYdfh6u34Uj7zTSVJTJv8CFNG90Olkigp1VKm1eET6k5Ug2Ae7d+JByd/xJY9R8znPj4ogcZhdfD1cufB7q1wc7k2c9Hfx5P4JmH4eLkhSRLvPDMUR4tpzP4+nnw45VH8fbx46eP55vLubaIZP7QHLaLCaFQ/yBw/KT9nUkgAvdvH0n7UW2TmGJfzhocE8OKY/sZ4hFZHcWkZkiRRO9yDmIYhPNqvIyNe/oxlG3cbLR8HexZ/MoVe7WORZZncgiL0egMhAT5EhAQwuFsrvD3ceO/bZfj7eLJ69us0Da+L3mAwzwqMqBdIVINgRvbtyKCJH7Ji8x4RjLtZ/Lp5D5v3JNO3fRx1A3yIj4ngi3mrSGgTjUqSuJKZS25+ITmml78x8RCd4pvw/ldLOH85k+Vb9pKpMMvNQaNmzjtP4ersSHFJGa99uqDGb79sp1ET38SY5XXVTaSTGtmvIy881g+93sBr/7eQucs2UVhUSr0gX957biR9OzXjl4+fI/ahl0i3meL62MDO7D2Sykffr2TfkVScHR147V+DeLhnG96bPAK1WkXSyTQ+mruCHQdTcHCwZ8rovozq34mnh/Vgxv9WculqjpV6SYiPIvX8ZSZNn8vGXUno9QZ6d4hj6sRhRNQLZOrEYYx/52vAmMHn26UbWbFpD3uPpJKTV4ikkgj282bapOEM7BrPp6+MYfWfBykpLeOZ4b3o1T6W85czGf3aF/x54Dg6nQ5fLw+6tm7CxBF9zFOkp016hKbhddl3JJUn/v0VSSfSkJEJql2Lvp2aM2lkH6SaNVJz5/O6VwfZBcX8uCaRqNBA3NycmTCqL/uTT/Fwn/ZWwbgtOw8zpE979iSd4Ldt+zh0Mg2dwqC4BHzw/Eg6mjLQvPvlLxytxnTRex21a3ng4mxMJ3X0Bld92WnUvDX+ISRJYuqcpXxokXLraOoFhkyZQeKC/xLTMITJjz7AyzN+sDr/vW+X8e/Pf0Gnv2aCj3/3a/p0jMPFyZEvF65hyofzTJF/I8a9PYd+nZvj5e5K65gIlplSSJVj2cbdPPrKTIosknoeP3MRGZkZL45mxAMdeHnGAvIKith7JJVxb8+u8FzHz1zk8Tdn0aNtDMH+3kTWC+TA8TN0bW1cxjtv+RarNFVXsnL56fc/+Xl1onldQXndGf/7zcr8T7uUyayf1zL31024ujjWuP5yT+6PrpdlDqVe4NBnC/lswR/UD6rN1r1H8a3lTn5hMcs27GLdXwe5nJXHeRttY0vyN8cNZsLIPgD8sXUfH5qWedZ02GnUZi1UeIPpsuIiQ6kXWJvSMi1fL664pVJpmZY5i9fzxetjGZDQgtc+/dG8ewvA2j8PWpEcjLMM0y5lEhkaxKZdyVYkB+OqtiOnLtAuriE+CltiHzp+xork5Zi/YivvTR6Bi5MDLaLqs3FnxSHRWh6u+Hi64VvLHS93F4pKSnF2csDZlFevfPJVfNMGODrYWS3cAeNU6HKrpbxuu2aR/LwmEYNNgtGSMm1N88/vPdNdCRczc7mYmcv2ai7yMBNBreKD50bw7Chj9pL9R1J59JXP0N8n+cgsn+JGknQARDUIRpLg/OWsaya0bZDTFMysG+CDu6uT1ZLayqCUs97qeGnZdSzMisjJKyTt0lXCgv2pF+hrLo8MDeLp4T3p3T6WwNq1cKgio81vW/bSu0Mc3dpEk7RsBis372XnoRPsP3aa1LTLVpN2Vm7Zy4ThvXhqaA/axTXk96372Z10kgPHz3Au/WqN3S9Pw32Iev4+fP3OU3Q1bf104EgqD4yfdktXqd1tZOUWoNXpUdurCAn0YdsNuOnlpmdeFcOL5cNwDvZ2FbZ7qgwF11k3UHgTiToNskypaVcYO42xuz7YvTXf//cZnB3tKS3TknwyjRPnLpGekU1WbgETR/axshq+WbKRBnUDGD+sB6FBtY2r5kb0RpZlTl/I4NP5vzHr53UYDAbe/Gwhft4eDO7aiuiIEKIjQsyaPvlUGu/MWmzOXFtTiV7jVZ2roz3PDOvJy+MG4+nmYjIzDzDypf/jajU0Uk1CfmExZy5cITI0iM7xUfzw27bqu0Ym89ROU/lSB7XKSG5Zliuunb+DTp4kSWZBo9Xp8PF0Y87b43B2tGf5pt1MnDaX85etU14/2q+jFdF1ej0vfDSP//thFT3axtAqOpwWUWFENahD/Tq1+ezVx3F1duL9b5eRV1jMsBc+NW9xHd+0AS2bhBEW7E90RAiLZjzP4MkfsWKTiLrf2ZCiLNMoNJBH+nZg7IPd8DMNz5RpdUyfvYRp3/x6yxJL3GtYtXUfkaFBPNS9NW98trBSM9wWaZeuAhBUu5aizwoQFuxnthwKi27jrjfXERpuLo7mTSdTzqbTOiYCTzcXiopLGfnKTIqKq39vaZcy+XbpRr5duhEwboYx59/j6N0hjqeGdOf9b5eZ6x5LvcAxi0QZjeoH8eMHk4mOqMuTD3cXRL+d8PFwpVnj+nh7uBJU24uoBsG0bdaIsGB/c/ZVgyyzMfEQL340j4Mn0rif8c3iDTwzrBduLk7MfO1xhr3wqVXQzBaBvl482L01P6/5i9IyLV4ernRuGcXq7Qcq1B1gmlK8K+nkdXzr24shPdvi5GBPRlYee5JTGZDQwmjRFBUrklySMCc6KYenm4t5MoxV/OdKFl/9so7eHeLwNOXNq6zu0dQL/PT7dqIjHjHXrUm4q+vRbxTNG4eyes4bLPhwMh+8OJrRg7oQHhKASiVRXFLGsnU76PbYv+n11LT7nuTlGu7DucsBGNytFYs/mUJ90/JcS3i5uzLhkV7sXfQ+CfFRXMnMZfHaHQB8/OJoAm0yw/br3JwRfTsgy/ClUi63W+nkmdoKCfS1WtcgAZ1aNGb65EcA+GLhGkpKyzibbrRGatfypHNL6/3X6wb4MG/6s4TWqW1VvmjG87z6xCC8bdJdq1UqurZuCmDeN37nT9MYO7iLeSeccjja29GpRWNT3ZrXt2qc6W6QZQx6A8WlZaSlX2Vf8ik27kxizZ8HSc/MuSNJIO8lTJ29FG9PN8YP7UH/hBb0bBfDviOnOZl2CQmoG+hLXGQobqYAXPmw18ufLKBdXCSRoYHsX/QBSzfsJCungCbhwfRsF4udRs33yzbzh4K2vx0YPaATD3Rqxv6jpykoKiGwthfNG9dHo1azeXcyH3xnFGh7kk+ReDCFNjERrPryVTbuSuJqdh7+Pp60b9YIlWTcd97R3s7C/Hdi6sRhvDx2AH/uP07q+cvGbLlRDYhrVI+SUq05xVaArxdz3n6S/04azvZ9x7hwJQtnB3s6NG9EeEgAV7Pzee+b5TXOw61xRJ887Vt+Xb+L7LxCikrKrNeT/8NIXh5omjj9O9YlHuK1fw0yJpaMjaBNrMUKP4PMnuRTzF22mR9MaZvSM7LpMvY/zHrzCXq0jWHcQ93M9YuKS3n/2+W8+9Viq0CcQZarHF6STccr21KpquOJB1Pw8/agW5tos2lZVFLKlwvX8sZnCyk1jV3rdHqGPD+DRZ9MoXV0OH06xJnbTjyYwqTpc/nh/YmE1w0wt/3h3OVMGN6LNrEN6dU+1up+diWd4uWPf2DbPuNKxtf/7ydGD+hETMN6DOoab/GeDfyxbT9TPprHKYtl0jWG6eYvTR5+G/j3vXyzPds0xd3NhUUms1NA2Q+PbhhiTq11NTufg8fPcLmKBUL1g/1oFhmKvb2GrJwCdhxKMU8zvt34/LWxjB/Wg3dmLeadrxYTHhJAoK8XZTodh1POVbraTpIkWseEExpUG61Oz8FjZ0g5W/WMR3dXZyJDA3F2dECn13Pq3GXSrypPuPKt5U543QDs7TQ2qjdjAAAF7klEQVSUlmk5dvoi2Xk1LuVVhpy0KAibKbBiZ7v7ABczsiukX74eUtMuk2qRGvpuwZjR9iIp1ciCI8syiQdSSDyQUu328wqKqr34JyMrj4ysvPumX6gENQTuDQg9I4gu8A+AJF7BbYRGvGmBu4ldSSdx/82JQwppuQVuD9EFBO445q3YYt4ZVkCY7gICAreI6CIaIiAgNPo9AiGOBARuBFKN8tHtNWpG9uuIp5sLv2/dR+FdXGghIFCTNfo9HXWPaxjCiH6deKCzcT63gIBA9W3gGqPRk09dYNXmPbi5OLF171Hx8wkI3ID5XmOIXlBSSr9nPxA/mYDAjfvoBjG8JiDwDzPdRTxbQOD+1OhiwoyAwD8BgugCAv8A071G5YwTEBAQGl1AQEAQXUBAEN1sywsICAiNLiAgIIguICBwj6HCOLqIugsI3H+QAVlodAEBYboLCAjcDxBz3QUE7n9lbrVTy0xgwU01pS2yI++CHwadHZJksBAZlfj9soQsS0gSyLIEyKbvAJJsdClkQEIudy/k8vYk0zmm/2XJQlSZvpvPkcz3ICNZtYEsmcpUVm3JqKzaNNc3tWu8H8n6mPk8lUV9i3Msy8x1rt2jjMqqLaz+N34315FV1sexvCebtq3egeraR7Z4J+aP+lo9WbJ5DtuPbPP8KpBkm2tW5TVKSMjXmpIADEq+pcX1bD/Y/JUt7sG2ngEwmK5ZXm6wqGOwOP/a/xIGkPTXyqTydsrLy8/Tm8rK29RblOlBMiCVl0l6U5mMJGmRJON5kqQz/TX9r9IhSQZJUhnbkFQG4wcZSa1DUhlQqY3lqGQkyfRRyUhq0/1LuusQ8YYhAQ7VdAWkSq4tVfJdpSChLHuIVMk1bNtTVXL9cgLIFUlqLlMptC3ZtK0gACockxQIKdmcW5HI1mWW39Wm72qLcrXpY2m1lZ+nsfhreT8aC6Jb/lVbPLvldSSb30KpTKqiTOm3N9i8dxthYiYgCmRWEgByRSJbtWEwEtJ8TIH4YKpT/jGRGJ1ZeFi3Y1vf8mMAtDbnay3O19u0pTVdT6dwTGdxL3qFZ7V8Rhkw3KrEEzJQcoOCoapyuQoC32h7UjXuRaqkzKDQ2Sqra9uObENMFDqvrdBSKbRjS3olYaO2ILHtR1MNwWBbZkl0O5u6lkJBuk47lsckBWFhKyyV3q2lIEbBqijv8FQhBLDR7liQxqBAdoOC0FCqY7Cpa0l827q292ioQmChINio5Hkkm/YU27xbGWbkapTfTMxAUjhX+huCR67iuFwJsat7DVnB6riZe61MAKgVhEdVloRa4X+1DblVNuUqm+9KpNcoWAmaSs6RbKwPdSWWkK0AkCt5t5KCdYCCZjfYaHTZRqNbHtcraHGDhfbV2VgKehstLtsclxWuYVDgglwNTlgqJrmyYNz9APkGhMqN1JGrWX4vBDSvZ/VICoJFViirzH2wtQ6U3AqVgnbHgryWZNfYCBk1YG/jNkg25yrdh6Tg4qkqEYK2JDLYCF5b/16voGmVynUWH0sSywrmuV5BINheT7ZwaaQqrBVbsss2FqnYkuk+hHyTwuxGhIh0HcGADclQEAS2BLcUDnYW2hwF10FViUVha81ICoJBUoi7yNcRfrJNLMHWLJcUtL2sQNrKfH0l4aFXcBFsLY/qantJEF3gZoSIfIPCQa4kUKlW0MDXC25qFMirqsT/V3JV1DZCRKrGp/yZVVX4zLZxAKXgmFyJuW6wIT8WVoFBQWgYKgkeygqxiFsadRe4vyDdITdEUvCpJZRHZuTrCAElU11ViaCQFOop1VdVEjCUqvGObE1tqZLouO1ogK3ZrlcQGPoqgoSKIxBCowvcbQtBqkQ7UokZXZUrQSWCQEmxqaup0bFxASpzXZTuw1aI2frQtoE3pdEEg40gqExYVBkzEhpd4H6zRKoSArZmtorK50XYtitVw+qoaohQyTqRFMiqsiG0kk+uFJSrLEpvEEQX+KeQ/magqkKAVCZQlOqpuH6QT1YguhJpLVGZJjcouRT/D/KQFSUTfh3TAAAAAElFTkSuQmCC'  width='250px' height='104px'/>";
        this.results += "</a></div><div class='title'>Test Results</div></div>";
        
        if (errorstr !== undefined) {
            this.results += "<div class='errorMsg'>" + errorstr + "</div>";
        }
        
        this.results += "<div class='stringSummary'>"
        this.results += "<h2>SQL Injection String Tests Summary ("+numTestsRun+" results recorded)</h2>"
        if (errorstr !== undefined) this.results += "<div class='withError'>"
        this.results += this.makeResultsGraph(numTestsRun, numFailes, numWarnings, 
                numPasses);
        if (errorstr !== undefined) this.results += "</div>"
        this.results += "</div>";
        
        this.results += "<h2>SQL Injection String Test Results</h2>";
        if (sortedResults.length) {
            if (errorstr !== undefined) this.results += "<div class='withError'>";
        }
        this.generateBodyOfReport(sortedResults, errorstr);
    }
    ,
    /**
     * Asynchronous recursive function which generates the body of the report.
     * @param sortedResults The sorted results
     * @param errorstr an error string (used if report generation failed and and error needs to be shown)
     * @param timeout used by setTimeout() (undefined for first call)
     * @param resultIndex used to keep track of which fieldResult we need to generate results for now (undefined for first call)
     */
    generateBodyOfReport: function(sortedResults, errorstr, timeout, resultIndex){

        if (timeout === undefined){
            var prefService = Components.
                        classes['@mozilla.org/preferences-service;1'].
                        getService(Components.interfaces.nsIPrefService);
            var branch = prefService.getBranch("extensions.sqlime.");
            
            timeout = branch.getIntPref('reportbuilding.timeout');
        }
        
        if (resultIndex === undefined) {
            resultIndex = 0;
        }
        
        if (resultIndex < sortedResults.length) {
            this.results += this.showFieldResult(sortedResults[resultIndex], this.showPasses);
            setTimeout(generateMoreOfReportBody, timeout, this, sortedResults,
                    errorstr, timeout, resultIndex+1);
        }
        else {
            this.generateEndOfReport(sortedResults, errorstr);
        }
    }
    ,
    /**
     * Generates the end (footer) of the report and writes it to a file.
     * @param sortedResults The sorted results
     */
    generateEndOfReport: function (sortedResults, errorstr) {
        
        if (sortedResults.length){
            if (errorstr !== undefined) this.results += "<div class='withError'>"
        }
        else {
            this.results += "<h3>No SQL Injection vulnerabilities found.</h3>"
        }
        this.results +="<div class='footer'>";
        var now = new Date();
        this.results += 'Results genenerated on ' + getMonthName(now.getMonth())  + " " + now.getDate() + ", " + now.getFullYear();
        this.results += ' for ' + this.testPageURL;
        this.results += "</div>"
        this.results+="</body></html>";
        
        var file = Components.classes['@mozilla.org/file/directory_service;1']
                .getService(Components.interfaces.nsIProperties)
                .get('TmpD', Components.interfaces.nsIFile);
        file.append('results_' + (new Date()).getTime() +'.tmp');
        file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
        
        // file is nsIFile, data is a string
        var foStream = Components.classes['@mozilla.org/network/file-output-stream;1']
                .createInstance(Components.interfaces.nsIFileOutputStream);

        foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); // write, create, truncate
        foStream.write(this.results, this.results.length);
        foStream.close();
        this.results="";
        
        resultsTab = getMainWindow().getBrowser().
                addTab(file.path);
        getMainWindow().getBrowser().selectedTab=resultsTab;
        getTestManager().postReport();
    }
    ,
    addObserver: function(attackRunner, attackHttpResponseObserver){
        
        /*
         * This will cause problems if the attackRunner 
         */
        this.httpresponseObservers[this.attacks.indexOf(attackRunner)] = 
                attackHttpResponseObserver;
    }
    ,
    /**
     * This will cause problems if the attackRunner has been evaluated before
     * this is called. However it evaluate is called on (or after) 
     * DOMContentLoaded which should happen after a response code has been 
     * received.
     */
    gotChannelForAttackRunner: function( nsiHttpChannel, attackHttpResponseObserver){
        var attackRunner = attackHttpResponseObserver.attackRunner;
        var observerService = Components.
                classes['@mozilla.org/observer-service;1'].
                getService(Components.interfaces.nsIObserverService);
        var results = checkForServerResponseCode(nsiHttpChannel)
        if (results != null){
            dump('resultmanager::gotChannelForAttackRunner results: ' + results + '\n');
            for each(var result in results){
                result.testData = attackRunner.testData;
                result.field = attackRunner.field;
            }
            var resultsWrapper = new Object();
            resultsWrapper.results = results;
            resultsWrapper.field = attackRunner.field;
            
            observerService.removeObserver(attackHttpResponseObserver, 
                    AttackHttpResponseObserver_topic);
            
            attackRunner.resultsWrappers.push(resultsWrapper);
                    
            this.addResults(resultsWrapper);
            
        }
        else {
            Components.utils.reportError('Failed to get http status code.');
        }
        dump('resultmanager::gotChannelForAttackRunner done.\n');
    }
    ,
    /**
     * 
     */
    addSourceListener:function(sourceListener, attackRunner){
        this.sourceListeners.push(sourceListener);
    }
    ,
    addSourceEvaluator: function(sourceEvaluator){
        var foo = this.sourceEvaluators.push(sourceEvaluator);
        Components.utils.reportError(" the new length is : " + foo);
    }
    ,
    evaluateSource: function(streamListener){
        
        var attackRunner = streamListener.attackRunner;
        for each(var sourceEvaluator in this.sourceEvaluators){
            var results = sourceEvaluator(streamListener);
            for each (var result in results){
                result.testData = attackRunner.testData;
                result.fieldIndex = attackRunner.fieldIndex;
                result.formIndex = attackRunner.formIndex;
                
            }
            var resultsWrapper = new Object();
            resultsWrapper.results = results;
            resultsWrapper.field = attackRunner.field;
            this.addResults(resultsWrapper);
        }
        var index = this.sourceListeners.indexOf(streamListener);
        this.sourceListeners.splice(index, 1);
        
        /* @todo this should probably be elsewhere */
        attackRunner.tabWrapper.inUse = false;
        attackRunner.tabWrapper = null;
        
        if (this.sourceListeners.length === 0 &&
            getTestRunnerContainer().testRunners.length === 0)
        {
            dump('\nall results now logged');
            this.allResultsLogged = true;
        }

        
    }
    ,
    header: function () {
        var rv ="";
        rv +="<html><head><title>Results</title>";
        rv += "<style>"
        rv += "* { font-family: arial; }";
        rv += "a img { border: 0;}";
        rv += "tfoot { font-size: small;  }";
        rv += "tfoot * p {margin: 0; padding:0;}"
        rv += ".legend {vertical-align: text-bottom; display: compact; width: .5em;float: left;}"
        rv += "div.logo { float: left; }"
        rv += "div.title { "
        rv += "font-size: 3em;"
        rv += "font-weight: bold;"
        rv += "padding-top: 24px;"
        rv += "padding-left: 260px;"
        rv += "}"
        rv += "div.results { clear: both; }"
        rv += ".header { margin-bottom: 40px; }"
        rv += ".footer {"
        rv += "border: 1px solid black;"
        rv += "background-color: #001f47;"
        rv += "color: #fff;"
        rv += "font-size: .8em;"
        rv += "text-align: center;"
        rv += "}"
        rv += ".stringSummary, .characterSummary {"
        rv += "padding-bottom: 10px;"
        rv += "}"
        rv += "h2 {"
        rv += "margin-bottom: 2px;"
        rv += "padding-bottom: 0;"
        rv += "background-color: #001f47;"
        rv += "color: #fff;"
        rv += "border: 1px solid black;"
        rv += "padding-left: 5px;"
        rv += "}"
        rv += ".pass {"
        rv += "background-color: #00B050;"
        rv += "border: 1px solid black;"
        rv += "}"
        rv += ".warn {"
        rv += "background-color: #FFC000;"
        rv += "border: 1px solid black;"
        rv += "}"
        rv += ".fail {"
        rv += "background-color: #C00000;"
        rv += "border: 1px solid black;"
        rv += "color: #fff;"
        rv += "}"
        rv += ".outcome div.pass, .outcome div.warn, .outcome div.fail {"
        rv += "margin-bottom: 5px;"
        rv += "margin-left: 40px;"
        rv += "padding: 5px;"
        rv += "}"
        rv += ".error { background-color:grey;"
        rv += "border: 1px solid black;"
        rv += "}"
        rv += ".errorMsg { background-color:#ff3333;"
        rv += "padding: 1em;"
        rv += "margin: 1em;"
        rv += "border: 1px solid black;"
        rv += "}"
        rv += "div.withError table.characterResults td.pass {"
        rv += "background-color: grey";
        rv += "}"
        rv += ".field {"
        rv += "background-color: #001f47;"
        rv += "color: #fff;"
        rv += "padding: 5px;"
        rv += "padding-left: 10px;"
        rv += "font-weight: bold;"
        rv += "}"
        rv += ".result {"
        rv += "background-color: #dddddd;"
        rv += "border: 1px solid black;"
        rv += "margin-bottom: 5px;"
        rv += "}"
        rv += ".submitted, .outcome {"
        rv += "padding: 5px;"
        rv += "margin-bottom: 5px;"
        rv += "}"
        rv += "ul { margin: 0; }"
        rv += "li {"
        rv += "margin-top: 0;"
        rv += "list-style: none;"
        rv += "}"
        rv += "table.characterResults td { width: 30px; }"
        rv += ".head {"
        rv += "text-align: center;"
        rv += "font-weight: bold;"
        rv += "background-color: #dddddd;"
        rv += "border: 1px solid black;"
        rv += "}"
        rv += "td.bar {"
        rv += "width: 99%;"
        rv += "background-color: #dddddd;"
        rv += "border: 1px solid black;"
        rv += "padding: 0;"
        rv += "margin: 0;"
        rv += "text-align: center;"
        rv += "}"
        rv += ".zero {color: black;";
        rv += "background-color: #C00000;"
        rv += "border: 1px solid black;}"
        rv += "</style></head><body>";
        return rv;
    }
};

function generateMoreOfReportBody(resultsManager, sortedResults, errorstr,
        timeout, resultIndex)
{
    resultsManager.generateBodyOfReport(sortedResults, errorstr, timeout,
            resultIndex);
}