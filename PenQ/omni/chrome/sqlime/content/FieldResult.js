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
 * FieldResult.js
 * A FieldResult represents the resulting "value" of a form's field after all
 * testing has been performed.
 * It holds all the results generated for a field.
 * This object is used for sorting.
 * @requires result.js
 */
function FieldResult(formIndex, fieldIndex){
    this.fieldIndex = fieldIndex;
    this.formIndex = formIndex;
    this.results = new Array();
    this.maxValue = 0;
    this.maxValueType = 0;
    this.state = 0;
}

/**
 * These consts are used to check what kind of rsults does this fieldresult
 * have.
 */
const fieldresult_has_pass = 0x0001;
const fieldresult_has_warn = 0x0002;
const fieldresult_has_error = 0x0004;

FieldResult.prototype = {
    addResults: function (resultsToAdd) {
        
        for each(var result in resultsToAdd) {
            if (this.maxValueType < result.type){
                this.maxValue = result.value;
                this.maxValueType = result.type;
            }
            else if (this.maxValueType === result.type ) {
                if (this.maxValue < result.value) {
                    this.maxValue = result.value;
                }
            }
            this.state = this.state | result.type;
            this.results.push(result); 
        }
    }
    ,
    getLength: function(){
        var numTestsRun = 0; 
        var numPasses = 0; 
        var numWarnings = 0;
        var numFailes = 0; 
        for each(var r in this.results) {
            numTestsRun++;
            switch(r.type){
                case RESULT_TYPE_ERROR:
                    numFailes++;
                    break;
                case RESULT_TYPE_WARNING:
                    numWarnings++;
                    break;
                case RESULT_TYPE_PASS:
                    numPasses++;
                    break;
            }
        }
        return [numTestsRun, numFailes, numWarnings, numPasses];
    }
    ,
    getSubmitState: function(){
        return this.results[0].testData;
    }
    ,
    sort: function(){
        var errors = new Array();
        var warnings = new Array();
        var passes = new Array();
        
        for each(var result in this.results) {
            switch(result.type){
                case RESULT_TYPE_ERROR:
                    errors.push(result);
                    break;
                case RESULT_TYPE_WARNING:
                    warnings.push(result);
                    break;
                case RESULT_TYPE_PASS:
                    passes.push(result);
                    break;
            }
        }
        
        return this.results = errors.concat(warnings, passes);
    }
}