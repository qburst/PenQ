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
 * Result.js
 */
 
const RESULT_TYPE_ERROR = 0x0004;
const RESULT_TYPE_WARNING =0x0002;
const RESULT_TYPE_PASS = 0x0001;

/**
 * The Result object is returned by evalutors.
 * The type defines whether the test resulted in an error, warning, or pass.
 * The value is used for sorting errors, warnings, and passes (usually doesn't 
 * matter for passes)
 * The message is what is to be displayed to the user. 
 */
function Result(type, value, message){
    this.value = value;
    this.type = type;
    this.message = message;
}

