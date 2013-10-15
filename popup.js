// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.



var CLEAR = "clear";
var LOGOUT = "logout";
var LOGIN = "login";
var UPGRADE = "upgrade";
var BUILD = "build";

var USERNAME = "username";
var PASSWORD = "password";
var AUTOLOGIN = "autologin";

var defaultUsername = "demo";
var defaultPassword = "demo";

var SESSIONNAME = 'session';


// Bad => http://samdutton.wordpress.com/2010/12/16/debugging-google-chrome-extensions/
var urlData;
var actionFunction;

var chinookChromeToolbar = {
    
  getCurrentUrl: function() {
	chrome.tabs.getSelected(function(tab){url = tab.url;  alert("hello");});
  },
    
  doAction: function(e) {
  
	chrome.browserAction.setIcon({path: 'ajax-loader.gif'});
  
	var action = e.target.id;
	switch (action) {
		case CLEAR :
			actionFunction = this.clear;
		break;
		case LOGOUT :
			actionFunction = this.logout;
		break;
		case LOGIN :
			actionFunction = this.login;
		break;
		case UPGRADE :
			actionFunction = this.upgrade;
		break;
		case BUILD:
			actionFunction = this.build;
		break;
		default:
		break;
	}
		
	chrome.tabs.getSelected( 
		function(tab) { 
			urlData = chinookChromeToolbar.getUrl(tab.url);
			actionFunction(tab.id, urlData);
		}
	);
  },
    
  clear: function(id, url) {
	$.ajax({
	  url: url + '?' + CLEAR + '&logout',
	  context: this,
	  success: function( data ) {
	  chrome.tabs.getSelected( function(tab) {
			chrome.tabs.update(tab.id, {url: urlData});
			chinookChromeToolbar.actionDone();
		});
	  }
	});
  },
  
  logout: function(id, url) {
	$.ajax({
	  url: url + '?' + LOGOUT,
	  context: this,
	  success: function( data ) {
	  chrome.tabs.getSelected( function(tab) {
			chrome.tabs.update(tab.id, {url: urlData});
			chinookChromeToolbar.actionDone();
		});
	  }
	});
  },
  
  login: function(id, url) {
  
	var usernameValue = $("#username").val();
	var passwordValue = $("#password").val();
	
	if(!usernameValue) {
		usernameValue = defaultUsername;
	}
	if(!passwordValue) {
		passwordValue = defaultPassword;
	}
	
	chinookChromeToolbar.addSessionData({username: usernameValue, password: passwordValue});
	
	urlData = url + '?' + USERNAME + '=' + usernameValue + '&' + PASSWORD + '=' + passwordValue + '&' + AUTOLOGIN;
	
	chrome.tabs.getSelected( function(tab) {
		chrome.tabs.update(tab.id, {url: urlData});
		chinookChromeToolbar.actionDone();
	});
	
  },
  
  upgrade: function(id, url) {
	$.ajax({
	  url: url + '?' + UPGRADE,
	  context: this,
	  success: function( data ) {
	  chrome.tabs.getSelected( function(tab) {
			chrome.tabs.update(tab.id, {url: tab.url});
			chinookChromeToolbar.actionDone();
		});
	  }
	});
  },
  
  build: function(id, url) {
	$.ajax({
	  url: url + '?' + BUILD,
	  context: this,
	  success: function( data ) {
	  chrome.tabs.getSelected( function(tab) {
			chrome.tabs.update(tab.id, {url: tab.url});
			chinookChromeToolbar.actionDone();
		});
	  }
	});
  },
  
  actionDone: function() {
	chrome.browserAction.setIcon({path: 'icon.png'});
	chrome.browserAction.setBadgeText ( { text: "done" } );
	setTimeout(function () {
		chrome.browserAction.setBadgeText( { text: "" } );
	}, 1000);
  },
  
  addSessionData: function(object) {
	if(typeof localStorage[SESSIONNAME] == 'undefined') {
		localStorage[SESSIONNAME] = '[]';
	}
	
	var sessionData = eval(localStorage[SESSIONNAME]);
	var res = $.grep(sessionData, function(val) {
		return val.username == object.username;
	});
	if($.isEmptyObject(res)) sessionData.push(object);
	
	localStorage[SESSIONNAME] = JSON.stringify(sessionData);
	
	$('#combobox').combobox('loadData', eval(localStorage[SESSIONNAME]))
	
	this.bindDeleteAction();
	
  },
  
  removeSessionData: function(usernameValue) {
	var sessionData = eval(localStorage[SESSIONNAME]);

	sessionData = $.grep(sessionData, function(value) {
	  return value.username != usernameValue;
	});
	
	localStorage[SESSIONNAME] = JSON.stringify(sessionData);
		
	$('#combobox').combobox('loadData', eval(localStorage[SESSIONNAME]))
	
	$.wait(5).then(function() {$('#combobox').combobox('clear');});
	
	this.bindDeleteAction();
	
	

  },
  
  getUrl: function(url) {
	return url.split('?')[0];
  },
  
  delete: function(username) {
	this.removeSessionData(username);
  },
  
  bindDeleteAction: function() {
	$.each(eval(localStorage[SESSIONNAME]), function(index, value) {
		$("#deleteUser" + value.username).click($.proxy(chinookChromeToolbar.delete, chinookChromeToolbar, value.username));
	});
  }
  
};


$("#clear").click($.proxy(chinookChromeToolbar.doAction, chinookChromeToolbar));
$("#logout").click($.proxy(chinookChromeToolbar.doAction, chinookChromeToolbar));
$("#login").click($.proxy(chinookChromeToolbar.doAction, chinookChromeToolbar));
$("#upgrade").click($.proxy(chinookChromeToolbar.doAction, chinookChromeToolbar));
$("#build").click($.proxy(chinookChromeToolbar.doAction, chinookChromeToolbar));

$('#combobox').combobox({
	data:eval(localStorage[SESSIONNAME]), 
    valueField:'password',
    textField:'username',
	onSelect: function(rec) {
		$("#username").val(rec.username);
		$("#password").val(rec.password);
	},
	formatter:function(row){
        var imageFile = 'icon-delete.png';
        return '<span class="item-text">'+row.username+'</span><a href="#" id="deleteUser' + row.username + '"><img style=\'width: 16px; height:16px; float: right;\' src="'+imageFile+' "/></a>';
    }
});

$.wait = function(time) {
  return $.Deferred(function(dfd) {
    setTimeout(dfd.resolve, time);
  });
}

chinookChromeToolbar.bindDeleteAction();
