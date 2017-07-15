/* UserSessionHandler - User Session Using SimpleSessionByJsCookie
//
//
// Copyright © 2017 Shahadat Hossain Khan <hello@shahadathossain.com>
//
// This program is free software. It comes without any warranty, to
// the extent permitted by applicable law.
 */
/* global _ */
(function(exports) {
	"use strict";
	var userSessionHandlerOfSHKR=function(pJQuery, pSessPrefix, pLoginExecuteHandler){
		var jQuery, sess, loginHandler, sessionPrefix, sessionName, readyCallback, readyCallbackExecutedFlag, loginCallback, logoutCallback, loginFlagObservingTimer;
		var tokenData, userLoginId, userData;
		this.setCallback=function(pLoginCallback, pLogoutCallback){
			loginCallback=pLoginCallback;
			logoutCallback=pLogoutCallback;
			this.triggerLoginFlagChanged();
			return this;
		};
		this.on=function(pCallbackName, pCallback){
			if(typeof pCallbackName==='undefined') throw 'please provide a callback name';
			if(typeof pCallback==='undefined') throw 'please provide a callback';
			if(pCallbackName==='login' || pCallbackName==='logout'){
				if(pCallbackName==='login') loginCallback=pCallback;
				if(pCallbackName==='logout') logoutCallback=pCallback;
			}else throw 'only login or logout callback supported currently';
			return this;
		};
		this.loginFlagPrevData;
		function stopObservingLoginFlag(){
			if(typeof loginFlagObservingTimer!=='undefined') clearInterval(loginFlagObservingTimer);
		}
		function startObservingLoginFlag(pThis){
			if(pThis.isSessionExists() && typeof loginFlagObservingTimer==='undefined'){
				if(!pThis.getSession().exists('loggedInFlag')) throw 'login flag not defined, unable to observe!';
				console.log('starting observer for flag change');
				pThis.triggerLoginFlagChanged();
				loginFlagObservingTimer=setInterval(
						function(){
								if(pThis.loginFlagPrevData!==pThis.getSession().get('loggedInFlag')) pThis.triggerLoginFlagChanged();
							}.bind(pThis),
						2000  /* 2000 ms = 2 sec */
					);
			}else console.log('unable to start observer for login flag!');
		}
		this.triggerLoginFlagChanged=function(){
			if(this.isSessionExists()){
				this.loginFlagPrevData=this.getSession().get('loggedInFlag');
				if(this.isLoggedIn() && typeof loginCallback!=='undefined') loginCallback(this);
				else if(typeof logoutCallback!=='undefined') logoutCallback(this);
			}else console.log('session not exists, unable to trigger login flag change...');
			return this;
		};
		this.setSession=function(pSession){
			sess=pSession;
			extractSession(this);
			return this;
		};
		this.getSession=function(){
			if(!this.isSessionExists()) throw 'session not found!';
			return sess;
		};
		this.setLoginHandler=function(pLoginHandler){
			loginHandler=pLoginHandler;
			return this;
		};
		this.isLoginHandlerExists=function(){ return (typeof loginHandler!=='undefined'); };
		this.getLoginHandler=function(){
			if(!this.isLoginHandlerExists()) throw 'login handler required before calling getLoginHandler()';
			return loginHandler;
		};
		this.login=function(pUserId, pPassword, pDenyCallback){
			if(!this.isLoginHandlerExists()) throw 'please set login handler to proceed!';
			this.getLoginHandler().logout().deny(pDenyCallback).login(pUserId, pPassword);
			return this;
		};
		this.logout=function(){
			if(this.isLoginHandlerExists()) this.getLoginHandler().logout();
			else if(this.isLoggedIn()) this.setUserLogout();
			return this;
		};
		/**
		 * don't call this method directly from outside
		 * ues logout method instead
		 * this method is calling from wms-login-executer-handler.js
		 */
		this.setUserLogout=function(){
			tokenData=userLoginId=userData=(function(){}()); /* tricks for undefine variable that declared using var */
			if(this.isSessionExists()){
				this.getSession().remove('tokenData');
				this.getSession().remove('userLoginId');
				this.getSession().remove('userData');
				setLoginFlag(this, 'no');
			}
			return this;
		};
		function setLoginFlag(pThis, pFlag){
			pThis.getSession().set('loggedInFlag', pFlag);
			pThis.triggerLoginFlagChanged();
		};
		this.setUserLoggedIn=function(pTokenData, pUserLoginId, pUserData){
			if(!this.isSessionExists()) throw 'session NOT init yet, unable to set user logged in';
			this.getSession().set('tokenData', pTokenData);
			tokenData=pTokenData;
			this.getSession().set('userLoginId', pUserLoginId);
			userLoginId=pUserLoginId;
			if(typeof pUserData!='undefined'){
				this.getSession().set('userData', pUserData);
				userData=pUserData;
			}
			setLoginFlag(this, 'yes');
			return this;
		};
		function getUserSessionData(pThis, pIdx){
			if(!pThis.isUserLoggedIn()){
				if(pThis.isSessionExists()) pThis.setUserLogout();
				throw 'user not logged in, unable to find "'+pIdx+'"';
			}
			if(!pThis.getSession().exists(pIdx)){
				pThis.setUserLogout();
				throw 'user logged in but "'+pIdx+'" missing!';
			}
			return pThis.getSession().get(pIdx);
		};
		this.getTokenData=function(){
			if(typeof tokenData==='undefined') tokenData=getUserSessionData(this, 'tokenData');
			return tokenData;
		};
		this.getLoggedinUserId=function(){
			if(typeof userLoginId==='undefined') userLoginId=getUserSessionData(this, 'userLoginId');
			return userLoginId;
		};
		this.isUserDataExists=function(){
			if(!this.isUserLoggedIn()) return false;
			return this.getSession().exists('userData');
		};
		this.getUserData=function(){
			if(typeof userData==='undefined') userData=getUserSessionData(this, 'userData');
			return userData;
		};
		/**
		 * recommended to use this method instead of "isUserLoggedIn"
		 */
		this.isLoggedIn=function(){ return this.isUserLoggedIn(); };
		this.isUserLoggedIn=function(){
			if(!this.isSessionExists()) return false;
			return (this.getSession().exists('loggedInFlag') && this.getSession().get('loggedInFlag')=='yes');
		};
		function extractSession(pThis){
			if(!pThis.isSessionExists()) throw 'unable to extract session data! session handler object not initialized...';
			if(!pThis.getSession().exists('loggedInFlag')) setLoginFlag(pThis, 'no');
			pThis.getLoginHandler().setUserSessionHandler(pThis);
			console.log('USH object created | Login Status: '+(pThis.isLoggedIn()?'Logged In':'NOT Logged In'));
			exeReadyCallback(pThis);
			startObservingLoginFlag(pThis);
			return pThis;
		};
		this.isSessionExists=function(){ return (typeof sess!=='undefined'); };
		this.ready=function(pCallback){
			readyCallbackExecutedFlag=false;
			readyCallback=pCallback;
			if(this.isSessionExists()) extractSession(this);
			return this;
		};
		this.isReadyCallbackExecuted=function(){
			if(typeof readyCallbackExecutedFlag==='undefined') return true;
			return readyCallbackExecutedFlag;
		};
		function exeReadyCallback(pThis){
			if(!pThis.isSessionExists()) throw 'session required before callback @sess handler';
			if(!pThis.isReadyCallbackExecuted() && typeof readyCallback!='undefined'){
				readyCallbackExecutedFlag=true;
				return readyCallback(pThis);
			}
			return pThis;
		};
		this.setJQuery=function(pJQuery){
			jQuery=pJQuery;
			return this;
		};
		this.getJQuery=function(){
			return jQuery;
		};
		this.setSessionPrefix=function(pSessPrefix){
			sessionPrefix=pSessPrefix;
			sessionName=pSessPrefix+'_ush';
			return this;
		};
		this.getSessionName=function(){
			if(typeof sessionName=='undefined') return 'ushShkr';
			return sessionName;
		};
		this.initSession=function(){
			var ush=this;
			SimpleSessionByJsCookie.create(this.getJQuery(), this.getSessionName()).ready(function(pMyUserSess){
				/* alert('user session ['+ush.getSessionName()+']: '+pMyUserSess.get('initMessage')); */
				ush.setSession(pMyUserSess);
			}.bind(ush));
			return this;
		};
		var __construct = function(that, pJQuery, pSessPrefix, pLoginExecuteHandler) {
			that.setJQuery(pJQuery);
			that.setSessionPrefix(pSessPrefix);
			that.setLoginHandler(pLoginExecuteHandler);
			/* alert('session init script... session name: '+that.getSessionName()); */
			if(typeof SimpleSessionByJsCookie=='undefined'){
				that.getJQuery().getScript('simple-session-by-js-cookie.js').done(function(script, textStatus) {
					console.log('... '+textStatus);
					that.initSession();
					console.log('session init done!');
				}.bind(that));
			}else that.initSession();
			return that;
		}(this, pJQuery, pSessPrefix, pLoginExecuteHandler);
	};

	exports.UserSessionHandler = {
		create : function(pJQuery, pSessPrefix, pLoginExecuteHandler) {
			if(pJQuery==undefined){
				throw 'jQuery NOT defined! unable to create session instance...';
			}
			if(pSessPrefix==undefined){
				throw 'Please provide a session prefix to continue!';
			}
			return new userSessionHandlerOfSHKR(pJQuery, pSessPrefix, pLoginExecuteHandler);
		},
	};
})(this);
/*
UserSessionHandler.create($, 'cms').ready(function(pUsh){
			alert('USH object created | '+' | Session: '+(pUsh.isSessionExists()?'Exists':'NOT Exists')+' | Login Status: '+(pUsh.isLoggedIn()?'Logged In':'NOT Logged In'));
		}.bind(document));
*/
