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
 * AttackHttpResponseObserver.js
 */
const AttackHttpResponseObserver_topic = 'http-on-examine-response';
 
function AttackHttpResponseObserver(attackRunner, resultsManager){
    
    this.attackRunner = attackRunner;
    this.resultsManager = resultsManager;
    
}

AttackHttpResponseObserver.prototype = {
    className: 'AttackHttpResponseObserver'
    ,
    QueryInterface: function(iid) {
        if (iid.equals(Components.interfaces.nsIObserver) || 
            iid.equals(Components.interfaces.nsISupports))
        {
            return this;
        }
        
        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    observe: function(subject, topic, data) {
        
        if (topic == AttackHttpResponseObserver_topic){
            try {
                var channel = subject.
                        QueryInterface(Components.interfaces.nsIHttpChannel)
                if (channel.responseStatus < 300 ||
                    channel.responseStatus >= 400)
                {
                    this.resultsManager.gotChannelForAttackRunner(channel,
                            this);
                }
            }
            catch(err) {
                dump('AttackHttpResponseObserver::observe: ' + err + '\n');
                for(var k in err)
                    dump('AttackHttpResponseObserver::observe: err['+k+'] ==' + err[k] + '\n')
            }
        }
        
    }
    
};