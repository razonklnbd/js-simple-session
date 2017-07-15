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
	var wmsLoginExecuteHandlerOfSHKR=function(pWmsStoreUrl){
		var jQuery, userSessionHandler, wmsStoreUrl, acceptCallback, denyCallback, errorCallback, beforeSendCallback;
		this.beforeSend=function(pCallback){
			beforeSendCallback=pCallback;
			return this;
		};
		function getBeforeSendCallback(){
			if(typeof beforeSendCallback=='undefined') return function(){};
			return beforeSendCallback;
		};
		this.logout=function(){
			/* ajax call for logout */
			logoutFromSession(this);
			return this;
		};
		this.login=function(pUserId, pPassword){
			if(typeof denyCallback==='undefined') throw 'please set deny callback before login';
			logoutFromSession(this);
			var wleh=this;
			var data2send={ user: pUserId, pass: this.md5(pPassword) };
			var ajaxOptions={
					type: 'POST',
					url: this.getWmsStoreUrl()+'api/login',
					data: JSON.stringify(data2send),
					/*success: function(data){
						// successful request; do something with the data
						$('#ajax-panel').empty();
						$(data).find('item').each(function(i){
							$('#ajax-panel').append('<h4>' + $(this).find('title').text() + '</h4><p>' + $(this).find('link').text() + '</p>');
						});
					},
					error: getErrorCallback(),*/
					contentType: "application/json; charset=utf-8",
			        dataType: "json",
			        headers: { 'X-Requested-With': 'XMLHttpRequest' },
				};
			if(typeof beforeSendCallback!=='undefined') ajaxOptions.beforeSend=beforeSendCallback;
			this.getJQuery().ajax(ajaxOptions).done(function(data, status, obj) {
				/*console.log('done: '+wleh.getWmsStoreUrl());
				console.log('Ajax status: ' + status);
				console.log('Ajax object: ' + obj);
				console.log('Ajax data: ' + lookdeep(data));*/
				setLoginIntoSession(wleh, data, status, obj);
				exeAcceptCallback(wleh, data, status, obj);
			}).always(function() {
				/*console.log('This code will always run! - '+wleh.getWmsStoreUrl());*/
			}).fail(function(data){
				switch (data.status) {
				case 401:
					return exeDenyCallback(wleh, data);
					/* alert('unauthorized: '+lookdeep(data)); */
				}
				getErrorCallback()(data);
			});
			return this;
		};
		function logoutFromSession(pThis){
			if(pThis.getUserSessionHandler().isLoggedIn()) pThis.getUserSessionHandler().setUserLogout();
		};
		function setLoginIntoSession(pThis, pData, pStatus, pAjaxObj){
			/* console.log('Ajax data: ' + lookdeep(pData));
			Ajax data: userId:shkhan,userData:{ username:shkhan, nickname:51SEEUser, role_id:null, type:1, userStatus:active, friend_version:0, device_version:1, register_date:2016-12-01 17:30:59, email:null, last_login:2016-12-01 19:04:45, birthday:0000-00-00 00:00:00, telephone:null, question:null, answer:null, login_time:0000-00-00, count:0},token:YTo2OntzOjk6ImlwQWRkcmVzcyI7czoxMToiMTkyLjE2OC42LjMiO3M6OToidXNlckFnZW50IjtzOjEwMzoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzU5LjAuMzA3MS4xMTUgU2FmYXJpLzUzNy4zNiI7czoxMToibG9nZ2VkSW5VaWQiO3M6Njoic2hraGFuIjtzOjEzOiJ1c2VyTnVtZXJpY0lkIjtzOjY6InNoa2hhbiI7czoxMDoidXNlclRleHRJZCI7czo2OiJzaGtoYW4iO3M6MTY6InVzZXJTZWNyZXRQaHJhc2UiO3M6MzI6IjIzN2I4MWMwOWQyY2IzNmUwNzMyYWY2Zjk4YjQzMTg2Ijt9 */
			pThis.getUserSessionHandler().setLoginHandler(pThis);
			pThis.getUserSessionHandler().setUserLoggedIn(pData.token, pData.userId, pData.userData);
		};
		this.accept=function(pCallback){
			acceptCallback=pCallback;
			return this;
		};
		function exeAcceptCallback(pThis, data, status, obj){
			if(typeof acceptCallback!=='undefined') return acceptCallback(pThis, data, status, obj);
			return pThis;
		};
		this.deny=function(pCallback){
			denyCallback=pCallback;
			return this;
		};
		function exeDenyCallback(pThis, pData){
			if(typeof denyCallback!='undefined') return denyCallback(pThis, pData);
			return pThis;
		};
		this.error=function(pCallback){
			errorCallback=pCallback;
			return this;
		};
		function getErrorCallback(){
			if(typeof errorCallback=='undefined') return function(data){
				switch (data.status) {
				case 400:
					alert('bad request [expected data missing]');
				case 405:
					alert('medhod or request type not allowed!');
				case 500:
					alert('Server error');
				}
			};
			return errorCallback;
		};
		function lookdeep(object){
		    var collection= [], index= 0, next, item;
		    for(item in object){
		        if(object.hasOwnProperty(item)){
		            next= object[item];
		            if(typeof next== 'object' && next!= null){
		                collection[index++]= item +
		                ':{ '+ lookdeep(next).join(', ')+'}';
		            }
		            else collection[index++]= [item+':'+String(next)];
		        }
		    }
		    return collection;
		};
		this.setJQuery=function(pJQuery){
			jQuery=pJQuery;
			return this;
		};
		this.getJQuery=function(){ return jQuery; };
		this.setUserSessionHandler=function(pUserSessionHandler){
			userSessionHandler=pUserSessionHandler;
			this.setJQuery(userSessionHandler.getJQuery());
			return this;
		};
		this.getUserSessionHandler=function(){ return userSessionHandler; };
		this.setWmsStoreUrl=function(pWmsStoreUrl){
			wmsStoreUrl=pWmsStoreUrl;
			return this;
		};
		this.getWmsStoreUrl=function(){
			if(typeof wmsStoreUrl==='undefined') throw 'WMS store url not defined!';
			return wmsStoreUrl;
		};
		
		/**
		 * this md5 works well at utf8 data that matched with php.
		 * programmer should carefull about encode at php coding as well as javascript coding
		 */
		this.md5 = function(s){
			function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]| (G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}
			function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}
			var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;
			s=J(s);
			C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;
			for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}
			var i=B(Y)+B(X)+B(W)+B(V);
			return i.toLowerCase()};
		var __construct = function(that, pWmsStoreUrl) {
			/*that.setUserSessionHandler(pUserSessionHandler);*/
			that.setWmsStoreUrl(pWmsStoreUrl);
			return that;
		}(this, pWmsStoreUrl);
	};

	exports.WmsLoginExecuteHandler = {
		create : function(pWmsStoreUrl) {
			/*if(typeof pUserSessionHandler==='undefined'){
				throw 'UserSessionHandler NOT defined! unable to create login executer...';
			}*/
			if(typeof pWmsStoreUrl==='undefined'){
				throw 'Please provide a wms store url to continue!';
			}
			if(typeof pWmsStoreUrl !== 'string'){
				if(typeof pWmsStoreUrl !== "function") throw 'store url expected as string or anon method or function';
				var fWmsStoreUrl=pWmsStoreUrl();
			}else var fWmsStoreUrl=pWmsStoreUrl;
			if(fWmsStoreUrl.trim().length <= 0) throw 'please provide a valid store url';
			const url = new URL(fWmsStoreUrl.trim());
			console.log('wms store url: '+url.href);
			return new wmsLoginExecuteHandlerOfSHKR(url.href);
		},
	};
})(this);

/*
UserSessionHandler.create($, 'cms').ready(function(pUsh){
			alert('USH object created | '+' | Session: '+(pUsh.isSessionExists()?'Exists':'NOT Exists')+' | Login Status: '+(pUsh.isLoggedIn()?'Logged In':'NOT Logged In'));
		}.bind(document));
*/

