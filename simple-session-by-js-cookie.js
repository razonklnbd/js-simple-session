/* SimpleSessionByJsCookie - Simple Session Using Js Cookie
//
// Examples
// --------
//
// Others
// --------
//     XORCipher.encode("test", "foobar");   // => "EgocFhUX"
//     XORCipher.decode("test", "EgocFhUX"); // => "foobar"
//
// Copyright © 2017 Shahadat Hossain Khan <hello@shahadathossain.com>
//
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law.
 */
/* global _ */
(function(exports) {
	"use strict";
	var simpleSessionByJsCookieOfSHKR=function(pJQuery, pSessName, undefined){
		var jQuery, ssCookies, sessionName, readyCallback, readyCallbackExecutedFlag;
		this.setJsCookies=function(pCookies){
			ssCookies=pCookies;
			if(!this.exists('initMessage')){
				var dt = new Date();
				/*alert('dt.toUTCString(): '+dt.toUTCString());*/
				this.set('initMessage', dt.toUTCString());
			}
			exeReadyCallback(this);
			return this;
		};
		this.getInitMessage=function(){
			if(!this.isCookieHandlerExists()) return '';
			if(!this.exists('initMessage')){
				var dt = new Date();
				/*alert('dt.toUTCString(): '+dt.toUTCString());*/
				this.set('initMessage', dt.toUTCString());
			}
			return this.get('initMessage');
		};
		this.isCookieHandlerExists=function(){ return (typeof ssCookies!=='undefined'); };
		this.ready=function(pCallback){
			readyCallbackExecutedFlag=false;
			readyCallback=pCallback;
			if(this.isCookieHandlerExists()) exeReadyCallback(this);
			return this;
		};
		this.isReadyCallbackExecuted=function(){
			if(typeof readyCallbackExecutedFlag==='undefined') return true;
			return readyCallbackExecutedFlag;
		};
		function exeReadyCallback(pThis){
			if(!pThis.isReadyCallbackExecuted() && typeof readyCallback!=='undefined'){
				readyCallbackExecutedFlag=true;
				return readyCallback(pThis);
			}
			return pThis;
		};
		this.setJQuery=function(pJQuery){
			jQuery=pJQuery;
			/* jQuery.cachedScript = function( url, options ) {
					// Allow user to set any option except for dataType, cache, and url
					options = jQuery.extend( options || {}, {
						dataType: "script",
						cache: true,
						 async: false, 
						url: url
					});
					// Use $.ajax() since it is more flexible than $.getScript
					// Return the jqXHR object so we can chain callbacks
					return jQuery.ajax( options );
				}; */
			return this;
		};
		this.getJQuery=function(){
			return jQuery;
		};
		// private constructor 
		this.setSessionName=function(pSessName){
			sessionName=pSessName;
			return this;
		};
		this.getSessionName=function(){
			if(typeof sessionName=='undefined') return 'ssShkr';
			return sessionName;
		};
		this.set=function(pVarName, pData){
			if(this.isCookieHandlerExists()){
				var data=ssCookies.getJSON(this.getSessionName());
				if(typeof data==='undefined') data={};
				data[pVarName]=pData;
				ssCookies.set(this.getSessionName(), data);
			}
			return this;
		};
		this.get=function(pVarName){
			if(this.isCookieHandlerExists()){
				var data=ssCookies.getJSON(this.getSessionName());
				if((typeof data!=='undefined') && data.hasOwnProperty(pVarName)) return data[pVarName];
			}
		};
		this.remove=function(pVarName){
			if(this.isCookieHandlerExists()){
				var data=ssCookies.getJSON(this.getSessionName());
				if((typeof data!=='undefined') && data.hasOwnProperty(pVarName)){
					var nData={};
					for(var i=0, keys=Object.keys(data), l=keys.length; i<l; i++) {
					    if(keys[i]!==pVarName) nData[keys[i]]=data[keys[i]];
					}
					ssCookies.set(this.getSessionName(), nData);
			    }
			}
			return this;
		};
		this.exists=function(pVarName){
			if(!this.isCookieHandlerExists()) return false;
			var data=ssCookies.getJSON(this.getSessionName());
			return ((typeof data!=='undefined') && data.hasOwnProperty(pVarName));
		};
		var __construct = function(that, pJQuery, pSessName, undefined) {
			/* alert('session init script... session name: '+that.getSessionName()); */
			that.setJQuery(pJQuery);
			that.setSessionName(pSessName);
			if(typeof Cookies=='undefined'){
				that.getJQuery().getScript('js.cookie.js').done(function(script, textStatus) {
					console.log('... '+textStatus);
					that.setJsCookies(Cookies.noConflict());
					console.log('cookie set done!');
				}.bind(that));
			}else that.setJsCookies(Cookies.noConflict());
			return that;
		}(this, pJQuery, pSessName, undefined);
	};

	exports.SimpleSessionByJsCookie = {
		create : function(pJQuery, pSessName) {
			if(pJQuery==undefined){
				throw 'jQuery NOT defined! unable to create session instance...';
			}
			if(pSessName==undefined){
				throw 'Please provide a session name to continue!';
			}
			return new simpleSessionByJsCookieOfSHKR(pJQuery, pSessName);
		},
	};
})(this);
/*
SimpleSessionByJsCookie.create($, 'ssgUserSess1').ready(function(pMySess){
			alert('session1: '+pMySess.get('initMessage')+' | '+document.getElementsByTagName('h1')[0].innerText);
		}.bind(document));
*/
