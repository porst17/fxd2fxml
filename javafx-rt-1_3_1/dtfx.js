/*
 * Copyright (c)  2008-2009 Sun Microsystems, Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   - Neither the name of Sun Microsystems nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* Location of runtime jars and JNLP file*/
 var runtime_codebase = "RUNTIME_CODEBASE";

/* Location of static web content - images, javascript files. For non-https deployment is the same as runtime_codebase */
 var runtime_url = "RUNTIME_CODEBASE";



var idCounter = 0;
var pingEnable = false;
var timedPings = 10; //max number of pings unless all applets started/failed
var timedPingsInterval = 10; //seconds
var appletIdTime = {};
var showStartup = false;

function dhtmlLoadScript(url) {
    var e = document.createElement("script");
    e.src = url;
    e.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(e);
}

function takeTimeStamp() {
    if (pingEnable) {
        var dtId = "deployJavaApplet" + (++idCounter);
        appletIdTime[dtId] = new Date().getTime();
    }

    return dtId;
}

function processTemplate(errMessage) {
    errMessage = errMessage.replace("MACOS_VERSION", dtfxObject.getMacOSVersion());
    errMessage = errMessage.replace("JAVA_VERSION", dtfxObject.getJavaVersion());
    return errMessage;
}

function sendPing(dtId, pingType) {
    if (pingEnable && appletIdTime[dtId] != 0) { //no pings if done
        var startTime = appletIdTime[dtId];
        var diffTime = new Date().getTime() - startTime;
        var href = runtime_url + "ping.js?t=" + pingType+ "&id=" + dtId +
            "&v=&tm=" + startTime + "&d=" + diffTime
            + "&j=" + dtfxObject.thisJavaVersion;
        if (appletIdTime[dtId] != 0) { //if applet has done status we do not need to send pings!
            dhtmlLoadScript(href);
        }
        if (pingType.substr(0, 4) == "done") {
            if (showStartup) {
               var el = document.getElementById(dtId);
               if (el != null) {
                   var child = document.createTextNode('Startup time: '+diffTime);
                   el.appendChild(document.createElement('p'));
                   el.appendChild(child);
               }
            }
            appletIdTime[dtId] = 0; //marker that applet is known to start or fail
        }
    }
}

function setupPeriodicPing() {
    if (pingEnable && timedPings > 0) {
        window.setTimeout(sendPeriodicPing, timedPingsInterval*1000);
        timedPings--;
    }
}

function sendPeriodicPing() {
    //only send ping if they are still enabled
    if (pingEnable && timedPings >= 0) {
       var unknownApplets = 0;
       for (var id in appletIdTime) {
         if (appletIdTime[id] != 0) { //applet status is still unknown
           sendPing(id, "timed"+timedPings);
           unknownApplets++;
         }
       }
       if (unknownApplets > 0) {
         setupPeriodicPing();
       }
    }
}

// Use this "include guard" to keep from including this code more than once.
var _DTFX_JS_;
if ( typeof( _DTFX_JS_ ) == "undefined" ) {
    _DTFX_JS_ = "Already Loaded";

    var dtfxObject = {
        // To determine what browser we're running, we'll run this table of searches
        // using the findEntryInList() function.  This method will run the searches, in
        // order, to find a match.  The arrays for varsToSearch and stringsToFind are
        // intended to be 1-to-1 matches.  That is, field 0 but have string 0, field 1
        // must have field 1, etc..  All searches in an entry must succeed in order for
        // the id to be returned.
        browserIDs: [
            {
                id: "MSIE",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "MSIE"              ]
            },
            {
                id: "Chrome",
                varsToSearch:  [ navigator.userAgent, navigator.vendor ],
                stringsToFind: [ "Chrome",            "Google" ]
            },
            {
                id: "Safari",
                varsToSearch:  [ navigator.userAgent, navigator.vendor ],
                stringsToFind: [ "Safari",            "Apple Computer" ]
            },
            {
                id: "Opera",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "Opera"             ]
            },
            {
                id: "Netscape Family",
                varsToSearch:  [ navigator.appName ],
                stringsToFind: [ "Netscape"        ]
            }
        ],

        // This is similar to the browserIDs list above, but is used to detect the
        // operating system type.
        OSIDs: [
            {
                id: "Windows",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "Windows"           ]
            },
            {
                id: "Mac",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "Mac OS X"          ]
            },
            {
                id: "Linux",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "Linux"             ]
            },
            {
                id: "SunOS",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "SunOS"             ]
            },
            {
                id: "UNIX",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "X11"               ]
            }
        ],

        // This is similar to the browserIDs list above, but is used to say that a
        // platform just doesn't support Java. This need be updated as technologies evolve
        NoJavaOS: [
            {
                id: "iPhone",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "iPhone" ]
            },
            {
                id: "iPod",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "iPod" ]
            }
        ],

        // This is similar to the browserIDs list above, but is used to say that a
        // browser on a platform just doesn't support Java. This need be updated as technologies evolve
        NoJavaBrowser: [
        ],

        // This is similar to the browserIDs list above, but is used to say that a
        // platform can't just download Java, but does support Java.
        NoJavaDownload: [
            {
                id: "Mac",
                varsToSearch:  [ navigator.userAgent ],
                stringsToFind: [ "Mac OS X"          ]
            }
        ],

        // These browsers support direct access to Java.  For example, the Java
        // property os.version can be accessed in these browsers from JavaScript by
        // simply issuing the command "java.lang.System.getProperty( "os.version" )" in
        // JavaScript.
        browsersSupportingDirectJavaAccess: [
            "Opera",
            "Netscape Family"
        ],

        // These browsers support ActiveX technlogy (Microsoft Internet Explorer).
        browsersSupportingActiveX: [
            "MSIE"
        ],

        // The ordered list of Java plugin versions to check for via ActiveX.
        activeXVersionList: [
            "1.8.0",
            "1.7.0",
            "1.6.0",
            "1.5.0",
            "1.4.2"
        ],

        // Given a list of entries in an array of objects containing the fields
        // id (string), varsToSearch (array of string vars), and stringsToFind (array of
        // strings to find), return the first id of the first successful match of all
        // strings to their respective fields.
        findEntryInList: function(listToUse) {
            var myID = null;

            for (var i = 0; i < listToUse.length; i++) {
                var match = true;
                for (var j = 0; j < listToUse[i].varsToSearch.length; j++) {
                    if (listToUse[i].varsToSearch[j].indexOf(listToUse[i].stringsToFind[j], 0) == -1) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    myID = listToUse[i].id;
                    break;
                }
            }

            return myID;
        },
       
        errorMessages: {
	    ErrorMacJavaUpgradeRequired: null,
	    ErrorMacOSVersionNotSupported: null,
	    ErrorNonMacJavaInstallRequired: null,
            ErrorChrome: null,
            ErrorJavaNotSupportedOS: null,
            ErrorJavaNotSupportedBrowser: null,
            ErrorJavaNotSupportedOpera1010: null
        },
        
        generateInPlaceErrorDisplay: function(displayMessage) {
  	    // This is code we'll use if the text makes the area bigger than
            // intended.
   	    var tagLeadChar = "<";
            var tagEndChar = ">";
       
            dtfxObject.smallErrorCode =  tagLeadChar + 'a href="http://java.com/"' + tagEndChar;
                
            dtfxObject.smallErrorCode += tagLeadChar + 'img src="' + runtime_url + 'java-coffee-cup-23x20.png' +
                                             '" border="0" width="23" height="20" alt="Java Coffee Cup"' +
                                             tagEndChar;

            // Add this code in with the text.
            var stringOutput = dtfxObject.smallErrorCode;

            stringOutput += displayMessage;
             
            stringOutput += tagLeadChar + '/a' + tagEndChar;

            // Add in the end-link to the small code version.
            dtfxObject.smallErrorCode += tagLeadChar + '/a' + tagEndChar;

            return stringOutput;
	},

	generatePopupErrorDisplay: function(displayMessage, popupMessageToUser) {
	    // This is code we'll use if the text makes the area bigger than
            // intended.
            var tagLeadChar = "<";
            var tagEndChar = ">";

            dtfxObject.smallErrorCode =  tagLeadChar +
                                                 'a href="javascript:dtfxObject.explainAndInstall(' +
                                                 "'" + popupMessageToUser + "'" + ')"' +
                                                 tagEndChar;
               
            dtfxObject.smallErrorCode += tagLeadChar + 'img src="' + runtime_url + 'java-coffee-cup-23x20.png' +
                                             '" border="0" width="23" height="20" alt="Java Coffee Cup"' +
                                             tagEndChar;

            // Add this code in with the text.
            var stringOutput = dtfxObject.smallErrorCode;

            stringOutput += displayMessage;
              
            stringOutput += tagLeadChar + '/a' + tagEndChar;

            // Add in the end-link to the small code version.
            dtfxObject.smallErrorCode += tagLeadChar + '/a' + tagEndChar;

            return stringOutput;
	},

	initErrorMsg: function() {
             dtfxObject.errorMessages.ErrorJavaNotSupportedBrowser = dtfxObject.generatePopupErrorDisplay(" The application could not load because your browser does not support Java. Click for more options.", "Please user another browser like Mozilla Firefox to view the application.");
             dtfxObject.errorMessages.ErrorJavaNotSupportedOpera1010 = dtfxObject.generatePopupErrorDisplay(" The application could not load because your browser does not support Java. Click for more options.", "Please upgrade your Opera to 10.50 and above to view the application.");

	     // use generatePopupErrorDisplay so explainAndInstall can be executed
	     dtfxObject.errorMessages.ErrorChrome = dtfxObject.generatePopupErrorDisplay(" A newer version of Java is needed to view the application. Click to update Java now.");

	     dtfxObject.errorMessages.ErrorJavaNotSupportedOS = dtfxObject.generateInPlaceErrorDisplay(" The application uses Java, but Java is not supported by your system. Use a computer with another operating system to view this applicaiton.");

	     dtfxObject.errorMessages.ErrorNonMacJavaInstallRequired = dtfxObject.generatePopupErrorDisplay(" A newer version of Java is needed to view the application. Click to update Java.", "Click to update Java.");

             dtfxObject.errorMessages.ErrorMacJavaUpgradeRequired = dtfxObject.generatePopupErrorDisplay(" The application could not load. Click for details.", "JavaFX requires Java 5.0 (1.5) or above.  Please use Software Update to upgrade your Java version.");

	     dtfxObject.errorMessages.ErrorMacOSVersionNotSupported = dtfxObject.generatePopupErrorDisplay(" The application could not load. Click for details.", "The application requires Mac OS 10.5 or newer. Please upgrade your OS to view the application. JavaFX requires Java 5.0 (1.5) or above.");

	},

        // Determine the current browser.  This is computed once and cached for future
        // access.
        thisBrowser: null,
        getBrowser: function() {
            // Skip the work if it's already been done.
            if (null === dtfxObject.thisBrowser) {
                // Just use the findEntryInList() function with the browserIDs list.
                dtfxObject.thisBrowser = dtfxObject.findEntryInList(dtfxObject.browserIDs);
                if (null === dtfxObject.thisBrowser) {
                    // No match.  Just say "unknown".
                    dtfxObject.thisBrowser = "unknown";
                }
            }

            return dtfxObject.thisBrowser;
        },

        // Determine if the current browser can access Java directly.  This is computed
        // once and cached for future access.
        thisBrowserCanAccessJava: null,
        browserCanAccessJava: function() {
            // Skip the work if it's already been done.
            if (null === dtfxObject.thisBrowserCanAccessJava) {
                var browser = dtfxObject.getBrowser();
                // Assume false until proven true.
                dtfxObject.thisBrowserCanAccessJava = false;
                // Walk through the list of browsers and see if this one is listed as
                // one that can call java directly.
                for (var i = 0; i < dtfxObject.browsersSupportingDirectJavaAccess.length; ++i) {
                    if (browser == dtfxObject.browsersSupportingDirectJavaAccess[ i ]) {
                        // This is a valid browser.
                        dtfxObject.thisBrowserCanAccessJava = true;
                        break;
                    }
                }
            }

            return dtfxObject.thisBrowserCanAccessJava;
        },

        // Determine if the current browser supports AcvtiveX.
        thisBrowserHasActiveX: null,
        browserHasActiveX: function() {
            // Skip the work if it's already been done.
            if (null === dtfxObject.thisBrowserHasActiveX) {
                var browser = dtfxObject.getBrowser();
                // Assume false until proven true.
                dtfxObject.thisBrowserHasActiveX = false;
                // Skip the test if the ActiveXObject doesn't exist.  Even if this is
                // IE, it COULD be IE on a different platform.
                if (null != window.ActiveXObject) {
                    for (var i = 0; i < dtfxObject.browsersSupportingActiveX.length; ++i) {
                        if (browser == dtfxObject.browsersSupportingActiveX[ i ]) {
                            dtfxObject.thisBrowserHasActiveX = true;
                            break;
                        }
                    }
                }
            }

            return dtfxObject.thisBrowserHasActiveX;
        },

        // Determine the current version of Java in the plugin for the platform.
        thisJavaVersion: null,
        getJavaVersion: function() {
            // Skip the work if it's already been done.
            if (null === dtfxObject.thisJavaVersion) {              
                // This is only IE on Windows. This gives no update version. only e.g. 1.6.0
                if ( ( null === dtfxObject.thisJavaVersion ) &&
                     ( dtfxObject.browserHasActiveX() ) ) {
                    for (var v = 0; v < dtfxObject.activeXVersionList.length; v++) {
                        try {
                            var axo = new ActiveXObject("JavaWebStart.isInstalled." +
                                                        dtfxObject.activeXVersionList[ v ] + ".0");
                            // This is not hit if the above throws an exception.
                            dtfxObject.thisJavaVersion = dtfxObject.activeXVersionList[ v ];
                            break;
                        } catch (ignored) {
                            // Just keep the error from propogating...
                        }
                    }
                }

                // Now we start trying generic solutions
                // Mime types to start. Works with netscape family browsers
                if (null === dtfxObject.thisJavaVersion) {
                    var bestVersionSeen = null;
                    // Walk through the full list of mime types.
                    for (var i = 0; i < navigator.mimeTypes.length; i++) {
                        var s = navigator.mimeTypes[i].type;
                        // The jpi-version is the plug-in version.  This is the best
                        // version to use.
                        var m = s.match(/^application\/x-java-applet;jpi-version=(.*)$/);
                        if (m !== null) {
                            dtfxObject.thisJavaVersion = m[1];
                            break;
                        }
                        // The generic java applet version will have multiple entries
                        // for all of the java versions supported by the plugin.  In the
                        // worst case, take the best java version we see here.
                        m = s.match(/^application\/x-java-applet;version=(.*)$/);
                        if (m !== null) {
                            if (( null === bestVersionSeen ) ||
                                ( m[1] > bestVersionSeen )) {
                                bestVersionSeen = m[1];
                            }
                        }
                    }
                    // If we found only generic applet versions, take the best one.
                    if (( null === dtfxObject.thisJavaVersion ) && ( null !== bestVersionSeen )) {
                        dtfxObject.thisJavaVersion = bestVersionSeen;
                    }
                }

                // LiveConnect is expensive. Only do this as last resort.
                // Only try this on browsers that we know support it.  Otherwise
                // we may get errors we can't catch.  This is not the most efficient
                // method of getting this information, but it is, by far, the most
                // reliable.
                if ( (null === dtfxObject.thisJavaVersion ) &&
                    dtfxObject.browserCanAccessJava() && ( typeof java == "object" ) ) {
                    dtfxObject.thisJavaVersion = java.lang.System.getProperty("java.version");
                }

                // Giving up.  Say the version is unknown.
                if (null === dtfxObject.thisJavaVersion) {
                    dtfxObject.thisJavaVersion = "0 - unknown";
                }
            }

            return dtfxObject.thisJavaVersion;
        },

        // Gets the basic OS name.
        thisOSName: null,
        getSystemOS: function() {
            // Skip the work if it's already been done.
            if (null === dtfxObject.thisOSName) {
                // Just use the findEntryInList() function with the OSIDs list.
                dtfxObject.thisOSName = dtfxObject.findEntryInList(dtfxObject.OSIDs);
                if (null === dtfxObject.thisOSName) {
                    dtfxObject.thisOSName = "unknown";
                }
            }

            return dtfxObject.thisOSName;
        },

        // Gets the os version for Mac systems.
        thisMacOSVersion: null,
        getMacOSVersion: function() {
            // Skip the work if it's already been done.
            if (null === dtfxObject.thisMacOSVersion) {
                // Verify this is actually being called from a Mac system.
                if ("Mac" != dtfxObject.getSystemOS()) {
                    dtfxObject.thisMacOSVersion = "Not Mac";
                }
                else {
                    // Mac system verified.  Can we get the version from Java?
                    if (dtfxObject.browserCanAccessJava()) {
                        dtfxObject.thisMacOSVersion = java.lang.System.getProperty("os.version");
                    }

                    // Direct access may have failed - check
                    if ( null === dtfxObject.thisMacOSVersion ) {
                        // Can't get it from Java.  Try the appVersion field. (The only
                        // known instance of this code being used is on Safari.  This
                        // code may need to be generalized if other browsers need it.)
                        var av = navigator.appVersion;
                        var m = av.match(/Mac OS X ([0-9_]*);/);
                        if (null !== m) {
                            dtfxObject.thisMacOSVersion = m[1];
                            dtfxObject.thisMacOSVersion = dtfxObject.thisMacOSVersion.split("_").join(".");
                        }
                    }
                }

                if (null === dtfxObject.thisMacOSVersion) {
                    dtfxObject.thisMacOSVersion = "unknown";
                }
            }

            return dtfxObject.thisMacOSVersion;
        },

        // Gets the Opera version
        thisOperaVersion: null,
        getOperaVersion: function() {
            if (null === dtfxObject.thisOperaVersion) {
                if ("Opera" != dtfxObject.getBrowser()) {
                    dtfxObject.thisOperaVersion ="Not Opera"
                } else {
                    var ua = navigator.userAgent;
                    var m = ua.match(/Version\/\d+\.\d+/gi);
                    if (null !== m) {
                        dtfxObject.thisOperaVersion = m[0].split("/")[1];
                    }
                    if (null === dtfxObject.thisOperaVersion) {
                        dtfxObject.thisOperaVersion = "unknown";
                    }
                }
            }
            return dtfxObject.thisOperaVersion;
        },

        // Keeps track of the possibly many overlays.
        overlayCount: 0,

        // We add in a bogus jar name to the jar list that's unique to prevent the
        // system from reusing the class loader.  The class loader gets reused when we
        // restart an applet in a browser session that has the same set of jars and
        // the running app.  Reusing the class loader causes static vars to be reused
        // from run to run without reinitialization.  We have a fix for this for
        // Java 1.6.0_10, but we need to hack this for backward JVM support.  Note
        // that the bogus jar file has negligible effect when it's not found.
        nameSeed: 0,
        getBogusJarFileName: function() {
            // Get/generate a unique number to make the name unique.
            if ( 0 === dtfxObject.nameSeed ) {
                dtfxObject.nameSeed = (new Date()).getTime();
            }
            var uniqueNum = dtfxObject.nameSeed++;

            // Should be unique enough (and unused).  The ".jar" is added later.
            return "emptyJarFile-" + uniqueNum;
        },

        // Can we get version info?  Some combinations just can't reliably determine
        // what version of Java they're running.
        isVersionAvailable: function() {
            var ret = true;
            // Check the combinations.
            if ( ( "Safari" == dtfxObject.getBrowser() ) &&
                 ( "Mac" == dtfxObject.getSystemOS() ) &&
                 ( dtfxObject.getMacOSVersion().indexOf( "10.4", 0 ) === 0 ) ) {
                ret = false;
            }

            return ret;
        },

        // Determine if the platform supports Java at all.  This is a negative test, so
        // we'll only reject systems that we KNOW don't support Java.  That way a
        // new (or unknown or difficult to identify) system isn't blocked out of
        // running Java.  Use the NoJava table above to specify Javascript ID criteria.
        javaSupport: null,
        getJavaSupportOS: function() {
            // Skip the work if it's already been done.
            if (null === dtfxObject.javaSupport) {
                // Just use the findEntryInList() function with the browserIDs list.
                var noSupportName = dtfxObject.findEntryInList(dtfxObject.NoJavaOS);
                if (null === noSupportName) {
                    // No match.  Java supported, as far as we know.
                    dtfxObject.javaSupport = true;
                }
                else {
                    // A match.  Java not supported.
                    dtfxObject.javaSupport = false;
                }
            }

            return dtfxObject.javaSupport;
        },

        // Determine if java is supported by this browser
        javaSupportBrowser: null,
        // returns "true", or not supported browser name, like "ChromeMac", "Opera10.xx"
        getJavaSupportBrowser: function() {
            if (null === dtfxObject.javaSupportBrowser) {
                // set default value to true
                dtfxObject.javaSupportBrowser = "true";
                // Just use the findEntryInList() function with the browserIDs list.
                var noSupportName = dtfxObject.findEntryInList(dtfxObject.NoJavaBrowser);
                if (null === noSupportName) {
                    // No match. Good. now check if Opera 10 and < 10.50
                    if ("Opera" == dtfxObject.getBrowser()) {
                        var operaVersion = dtfxObject.getOperaVersion().split(".");
                        if ( (operaVersion[0] == 10) && (operaVersion[1] < 50) ) {
                            // we only disable opera 10.0 to 10.49. Opera 9 is reported to work
                            dtfxObject.javaSupportBrowser = "Opera"+operaVersion[0]+"."+operaVersion[1];
                        } 
                    }
                }
                else {
                    // A match.  Java not supported.
                    dtfxObject.javaSupportBrowser = noSupportName;
                }
            }
            return dtfxObject.javaSupportBrowser;
        },

        // Determine if we have a download for the platform for Java.  Doing a negative
        // test here, so that we just say who we don't support for sure.  Better that
        // than put who we DO support, and not give a new (or unknown, or difficult to
        // identify) platform a way to download.  Use the NoJavaDownload table above to
        // specify Javascript ID criteria.
        javaDownloadSupport: null,
        getJavaDownloadSupportExists: function() {
            // Skip the work if it's already been done.
            if (null === dtfxObject.javaDownloadSupport) {
                // Just use the findEntryInList() function with the browserIDs list.
                var noSupportName = dtfxObject.findEntryInList(dtfxObject.NoJavaDownload);
                if (null === noSupportName) {
                    // No match.  Java download not supported, as far as we know.
                    dtfxObject.javaDownloadSupport = true;
                }
                else {
                    // A match.  Java download not supported.
                    dtfxObject.javaDownloadSupport = false;
                }
            }

            return dtfxObject.javaDownloadSupport;
        },

        // Arrays to track error message boxes and their expected sizes for the
        // function below.  onloadCheckErrorDisplay() is set up as an onload
        // event handler if we have issues with Java on the platform.  It 
        // verifies that the spaces that we've allocated for the applets don't
        // exceed the intended size of the applet.  If they do, we pull the 
        // text message out of each oversized box.
        errorMessageBoxes: null,
        errorMessageWidths: null,
        errorMessageHeights: null,
        onloadHandlerQueued: false,
        smallErrorCode: "",

        onloadCheckErrorDisplay: function() {
            var boxId;
            var width;
            var height;
            // For each errr box we created on the page...
            while ( dtfxObject.errorMessageBoxes.length > 0 ) {
                // Get the relevant data
                boxId = dtfxObject.errorMessageBoxes.pop( );
                width = dtfxObject.errorMessageWidths.pop( );
                height = dtfxObject.errorMessageHeights.pop( );
                var tableForBox = document.getElementById( boxId );
                // Is the box the intended size?
                if ( ( tableForBox.offsetHeight != height ) ||
                     ( tableForBox.offsetWidth != width ) ) {
                    // Replace the contents of the box only with the little
                    // java logo - text is removed.
                    tableForBox.rows.item(0).cells.item(0).innerHTML = dtfxObject.smallErrorCode;
                }
            }
        },

        // JavaFX deployment code
        // The javafx function for generating code to launch JavaFX applets.  Returns
        // a string for use where ever the user prefers.
        javafxString: function(launchParams, appletParams) {
            // String for return.
            var stringOutput = "";
            var errorMessageToUser = "";

            var appletID = takeTimeStamp();

            // Is java even available on this platform?
            if ( !dtfxObject.getJavaSupportOS() ) {
                // Java known to not be supported for this platform.
                errorMessageToUser = dtfxObject.errorMessages.ErrorJavaNotSupportedOS;
                sendPing(appletID, "done_unsupportedbyjre");
            } else if ( "true" !== dtfxObject.getJavaSupportBrowser() ) {
                var browser = dtfxObject.getJavaSupportBrowser();
                // Java is supported on this platform, but not this browser
                if (null !== browser.match(/Opera10/i)) {
                    errorMessageToUser = dtfxObject.errorMessages.ErrorJavaNotSupportedOpera1010;
                } else {
                    // generic error message
                    errorMessageToUser = dtfxObject.errorMessages.ErrorJavaNotSupportedBrowser;
                }
                sendPing(appletID, "done_unsupportedbrowser");
            }

            // This test has proven unreliable.  Skip it.
            // else if (!navigator.javaEnabled()) {
            //    // No java - try to get the user to install
            //    errorMessageToUser = "Java is required to run JavaFX applications.";
            //}
            // Some browsers you just can't reach.  They won't tell you what Java they
            // run, or worse, they lie.  Skip the version test if this is one of those
            // browsers.
            else if ( dtfxObject.isVersionAvailable() ) {
                // Got Java.  Check the Java version.
                // The "V" stuff in the comparison forces a string compare.  Otherwise,
                // there may be an issue on some platforms with comparing a number to
                // a string, even if the number is in quotes.
                var javaVersion = dtfxObject.getJavaVersion();
                sendPing(appletID, "start");
                if (("V" + javaVersion ) < "V1.5") {
                    // Not good enough.  Mac based?
                    // Safari has an issue with the base indexOf() method.  Use the
                    // specific version that says "start at byte x", but just use the
                    // first byte.
                    if ("Mac" == dtfxObject.getSystemOS()) {
                        // Mac version < 10.5?  Again, leading "V" prevents some browsers
                        // from converting a version string to a number and hosing the
                        // comparison.
                        var osVersion = dtfxObject.getMacOSVersion();
                        if (("V" + osVersion ) < "V10.4") {
                            errorMessageToUser = dtfxObject.errorMessages.ErrorMacOSVersionNotSupported;
                            sendPing(appletID, "done_oldmac");
                        }
                        else {
                            errorMessageToUser = dtfxObject.errorMessages.ErrorMacJavaUpgradeRequired;
                            sendPing(appletID, "done_oldjremac");
                        }
                    } // End of if this is a Mac
                    else {
                        // Not an apple system.  Try to do an upgrade.
   			if ("Chrome" === dtfxObject.getBrowser()) {
                           errorMessageToUser = dtfxObject.errorMessages.ErrorChrome;
			} else {
			   errorMessageToUser = dtfxObject.errorMessages.ErrorNonMacJavaInstallRequired;
			}
                        if ("0 - unknown" == javaVersion) {
                           sendPing(appletID, "done_nojre");
                        } else {
                             sendPing(appletID, "done_oldjre");
                        }
                    }
                } // End of if version is good enough.
            } else { // End of if we can get Java version info.
                sendPing(appletID, "start2");
            }

            // Either Java is good enough, or we have an error message to display.

            // Standard archives for JavaFX - base names only.  We'll be adding
            // version number (maybe) and ".jar" (definitely) to each.
            var standardArchives = [ ];
            var standardArchivesPrepend = [];

            // Add the right platform dependent libs
            switch (dtfxObject.getSystemOS()) {
                case "Mac":
                    standardArchives.push("javafx-rt-macosx-i586-1_3_1");
                    
                    break;
                case "Windows":
                    standardArchives.push("javafx-rt-windows-i586-1_3_1");
                    
                    break;
                case "Linux":
                    standardArchives.push("javafx-rt-linux-i586-1_3_1");
                    
                    break;
                case "SunOS":
                    standardArchives.push("javafx-rt-solaris-i586-1_3_1");
                    
                    break;
            }

            // Add in the bogus filename
            standardArchives.push( "desktop/" + dtfxObject.getBogusJarFileName() );

            // The JavaFX version number to be used (appended to the names above
            // with an "__V" if supplied.  The old browser plugin does not cache
            // any HTTP GET requests with arguments so we have to use the "__V"
            // naming ...
            var versionNumber = "";

            // The Applet launcher
            var appletPlayer = "org.jdesktop.applet.util.JNLPAppletLauncher";

            // Debug stuff.  Setting the tagLeadChar to "&gt;" will allow us
            // to see what the Javascript is generating in the browser window.
            // Also, carriage return can just be \n normally, but adding in
            // "<br>" also makes it more readable for debugging.  This is handled
            // below if displayhtml exists and is set to true.
            var tagLeadChar = "<";
            var tagEndChar = ">";
            var carriageReturn = "\n";

            // Set up default applet tag parameters
            var appletTagParams = {};
            appletTagParams.code = appletPlayer;

            // Set up the default parameters
            var params = {};
            params.codebase_lookup = "false";
            params["subapplet.classname"] = "com.sun.javafx.runtime.adapter.Applet";
            params.progressbar = "false";
            params.classloader_cache = "false";

            var loading_image_url = null;
            var loading_image_width = -1;
            var loading_image_height = -1;
            var loading_background = "white"; 

            var app_version = null;
            var archive = "";

            // Add in/replace with the launchParams provided
            var key = "";
            if (typeof launchParams != "string") {
                // Walk through the passed in object, taking each parameter
                // and adding it to the appletTagParams
                for (key in launchParams) {
                    // Handle "special" parameters...
                    switch (key.toLocaleLowerCase()) {
                        case "archive":
                            archive = launchParams[key];
			    break;
                        case "app_version":
                            app_version = launchParams[key];
			    break;
                        case "jnlp_href":
                        // Handle the jnlp for the application
                            params.jnlp_href = launchParams[key];
                            break;
                        case "version":
                        // This is a version number for JavaFX runtime.
                            versionNumber = launchParams[key];
                            break;
                        case "code":
                        // This is actually a parameter to the jnlp app.
                            params.MainJavaFXScript = launchParams[key];
                            break;
                        case "name":
                        // This is actually a parameter to the jnlp app.
                            params["subapplet.displayname"] = launchParams[key];
                            break;
                        case "draggable":
                            params[key] = launchParams[key];
                            break;
                        case "displayhtml":
                            if (launchParams[key]) {
                                // Reset the tag wrappers so that the html will display
                                // rather than be usable.
                                tagLeadChar = "&lt;";
                                tagEndChar = "&gt;";
                                carriageReturn = "<br>\n";
                            }
                            break;
                        case "loading_image_url":
                            loading_image_url = launchParams[key];
                            break;
                        case "loading_image_width":
                            loading_image_width = launchParams[key];
                            break;
                        case "loading_image_height":
                            loading_image_height = launchParams[key];
                            break;
                        case "loading_background":
                            loading_background = launchParams[key];
                            break;
                        default:
                        // This is a generic parameter to the APPLET tag.
                        // Pass it along.
                            appletTagParams[key] = launchParams[key];
                            break;
                    }
                }
            } else {
                // We got a string as the first parameter.  Assume that it's
                // a JAR intended to be part of the archive.
                archive = launchParams;
            }

            // Check for an error message now that we've processed input 
            // parameters to get size and display options.  If there, display a 
            // canned graphic and the message to encourage the user to 
            // install/upgrade Java.
            if ( errorMessageToUser != "" ) {

                // We'll use the ids in the tables used to reserve the size of
                // the applet.  We'll then double-check that none have exceeded
                // their intended size due to the text message.
                var errId = "errorWithJava" + (++dtfxObject.overlayCount);

                var w = appletTagParams.width;
                var h = appletTagParams.height;
                // Generate an error display
                stringOutput += tagLeadChar + 'div id="JavaLaunchError" style="width:' + w +
                                ';height:' + h +
                                ';background:white"' + tagEndChar +
                                carriageReturn;
                stringOutput += tagLeadChar + 'table id="' + errId +
                                '" width=' + w + ' height=' +
                                h + ' border=1 padding=0 margin=0' + tagEndChar +
                                carriageReturn;
                stringOutput += tagLeadChar + 'tr' + tagEndChar + tagLeadChar +
                                'td align="center" style="vertical-align: middle;" valign="middle"' + tagEndChar +
                                carriageReturn;
	
                stringOutput += processTemplate(errorMessageToUser);

                // Close out the table & div
                stringOutput += tagLeadChar + '/td' + tagEndChar + tagLeadChar + '/tr' +
                                tagEndChar + tagLeadChar + '/table' + tagEndChar +
                                carriageReturn;
                stringOutput += tagLeadChar + '/div' + tagEndChar + carriageReturn;

                // Later we'll be doing a check on these boxes - add this one
                // to arrays to check sizes onload...
                dtfxObject.errorMessageBoxes.push( errId );
                dtfxObject.errorMessageWidths.push( w );
                dtfxObject.errorMessageHeights.push( h );

                // If we haven't done it yet, queue an onload handler for 
                // checking actual table sizes.
                if ( !dtfxObject.onloadHandlerQueued ) {
                    if ( window.attachEvent ) {
                        window.attachEvent("onload", dtfxObject.onloadCheckErrorDisplay);
                    }
                    else if ( window.addEventListener ) {
                        window.addEventListener("load", dtfxObject.onloadCheckErrorDisplay, false);
                    }
                    else {
                        document.addEventListener("load", dtfxObject.onloadCheckErrorDisplay, false);
                    }
                }

                // We're doing in-place install message - return the string.
                return stringOutput;
            } // End of if we have a Java error
            // Java is OK.

            // list of native jars from extensions is part of applet-launcher jar
            params[ "jnlpNumExtensions" ] = 0;

            // Verify that we have a jnlp_href.  If not, take the first jar in our
            // archive and assume the jnlp has the same name but a different extension.
            if (params.jnlp_href === undefined) {
                // Get the first jar extracted from the archive line.
                var loc = archive.indexOf(".jar,");
                if (-1 == loc) {
                    // No comma following a .jar.  Just find the last occurrance of ".jar"
                    loc = archive.lastIndexOf(".jar");
                }
                // Don't bother if there was no archive in the list
                if (-1 != loc) {
                    params.jnlp_href = archive.substr(0, loc) +
                                       "_browser.jnlp";
                }
            }

            // Since the user will probably supply us with a JAR as an
            // archive parameter, add in these default jar parameters
            // after the fact so they don't get wiped out.
            if (app_version == null) {
                // use archive tag directly
                appletTagParams.archive = archive;
            } else {
                // construct cache_archive and cache_version tag
                appletTagParams.archive = "";
                var numOfJars = archive.split(",").length;

                params.cache_archive = archive;
                params.cache_version = "";
                for (var i = 0; i < numOfJars; i++) {
                    params.cache_version += app_version + ",";
                }
            }

            //applet launcher should be in front, 
            //so for non jnlp applet it will have precedence loading
            var archive = "";
            for (var i = 0; i < standardArchivesPrepend.length; i++) {
                // The base name
                if (i > 0) {
                    archive += ",";
                }
                archive += runtime_codebase + standardArchivesPrepend[i];
                // The version number, if any.
                if (versionNumber !== "") {
                    archive += "__V" + versionNumber;
                }
                // And the extension.
                archive += ".jar";
            }
            appletTagParams.archive = archive + "," + appletTagParams.archive;

            //rest of FX jars go to the end of classpath
            for (var i = 0; i < standardArchives.length; i++) {
                // The base name
                appletTagParams.archive += "," + runtime_codebase + standardArchives[i];
                // The version number, if any.
                if (versionNumber !== "") {
                    appletTagParams.archive += "__V" + versionNumber;
                }
                // And the extension.
                appletTagParams.archive += ".jar";
            }

            if (dtfxObject.fxOverlayEnabled()) {
                // Output the animation overlay
                var dtId = "deployJavaApplet" + (++dtfxObject.overlayCount);
                params["deployJavaAppletID"] = dtId;                // so that Applet.fx can call fxAppletStarted()
                var width = appletTagParams.width;
                var height = appletTagParams.height;
                var img;
                var imgWidth;
                var imgHeight;

                //hideOverlay if it takes too long (may hide the real error)
                window.setTimeout(function() {hideOverlay(dtId); sendPing(id, "done_timeout");}, 180*1000);

                // Did the applet author specify a loading image?
                if (loading_image_url !== null && loading_image_height > 0 && loading_image_width > 0) {
                    img = loading_image_url;
                    imgWidth = loading_image_width;
                    imgHeight = loading_image_height;
                } else {
                    // Use default loading animation
                    img = runtime_url;
                    if (width >= 100 && height >= 100) {
                        img += 'javafx-loading-100x100.gif';
                        imgWidth = 80;
                        imgHeight = 80;
                    } else {
                        img += 'javafx-loading-25x25.gif';
                        imgWidth = 25;
                        imgHeight = 25;
                    }
                }
                stringOutput += tagLeadChar + 'div id="' + dtId + 'Overlay' +
                                '" style="width:' + width + ';height:' + height +
                                ';position:absolute;background:' + loading_background + '"' + tagEndChar +
                                carriageReturn;
                stringOutput += tagLeadChar + 'table width=' + width + ' height=' +
                                height + ' border=0 cellpadding=0' + 
                                ' style="border-width:0px;border-spacing:0px 0px;margin:0px;padding:0px;"' +
                                tagEndChar + carriageReturn;
                stringOutput += tagLeadChar + 'tr' + tagEndChar + tagLeadChar +
                                'td align="center" valign="middle" style="vertical-align: middle;"' + tagEndChar +
                                carriageReturn;
                stringOutput += tagLeadChar + 'img src="' + img + '" alt="" width=' +
                                imgWidth + ' height=' + imgHeight + tagEndChar +
                                carriageReturn;
                stringOutput += tagLeadChar + '/td' + tagEndChar + tagLeadChar + '/tr' +
                                tagEndChar + tagLeadChar + '/table' + tagEndChar +
                                carriageReturn;
                stringOutput += tagLeadChar + '/div' + tagEndChar + carriageReturn;
                stringOutput += tagLeadChar + 'div id="' + dtId +
                                '" style="position:relative;left:-10000px"' +
                                tagEndChar + carriageReturn;
            }

            // Output the base APPLET tag and embedded parameters
            stringOutput += tagLeadChar + "APPLET MAYSCRIPT" + carriageReturn;
            for (key in appletTagParams) {
                stringOutput += key + "=";
                if (typeof appletTagParams[key] == "number") {
                    stringOutput += appletTagParams[key];
                } else {
                    stringOutput += "\"" + appletTagParams[key] + "\"";
                }
                stringOutput += carriageReturn;
            }
            stringOutput += tagEndChar + carriageReturn;


            // Add in/replace with the appletParams provided
            // Walk through the passed in object, taking each parameter
            // and adding it to the params
            if (appletParams) {
                for (key in appletParams) {
                    params[key] = appletParams[key];
                }
            }
            if (pingEnable) {
                params["pingAppletID"] = appletID;
                params["fxbuild"] = '';
                params["pingTS"] = appletIdTime[appletID];
            }

            // Output the parameter kags.  These are intended to be consumed by the
            // called application.
            for (key in params) {
                stringOutput += tagLeadChar + "param name=\"" + key +
                                "\" value=\"" + params[key] + "\"" +
                                tagEndChar + carriageReturn;
            }

            // Close out the APPLET tag
            stringOutput += tagLeadChar + "/APPLET" + tagEndChar + carriageReturn;

            if (dtfxObject.fxOverlayEnabled()) {
                stringOutput += tagLeadChar + "/div" + tagEndChar + carriageReturn;
            }

            return stringOutput;
        },

        fxOverlayEnabled: function() {
            return (dtfxObject.getBrowser() != "Netscape Family" && dtfxObject.getBrowser() != "Opera") || dtfxObject.getSystemOS() != "Mac";
        },

        // This function is called if we have a Java error and someone clicks
        // on one of the error messages.  This displays the full error, and,
        // if supported, offers to install Java.
        explainAndInstall: function( explanation ) {
            var startJREInstall = function() {
               // deployJava.js is only loaded when the error message is output
               // so IDE's show warnings here ...
               deployJava.do_initialize(); //call explicitly as handler may be invoked before!
               deployJava.returnPage = document.location;
               deployJava.installLatestJRE();
            };

            // Only offer download if (1) we have downloads, and (2) the 
            // platform even supports Java.
            if ( dtfxObject.getJavaDownloadSupportExists() &&
                 dtfxObject.getJavaSupportOS() &&
                 ("true" == dtfxObject.getJavaSupportBrowser())) {
               if (typeof(deployJava) == 'undefined') {
                  if (dtfxObject.getBrowser() == "MSIE") {
                     var script = document.createElement('SCRIPT');
                     script.type = 'text/javascript';
                     script.src = 'http://java.com/js/deployJava.js';

                     var head = document.getElementsByTagName('HEAD');
                     if (head[0] != null)
                        head[0].appendChild(script);

                     //script is loaded asyncronously and it may take time to complete
                     script.onreadystatechange = startJREInstall; //IE
                     script.onload = startJREInstall; //FF
                  } else {
                     //dynamic loading approach does not work well with FF, use static redirection
                     location.href='http://java.sun.com/webapps/getjava/BrowserRedirect?host=java.com';
                  }
               } else {
                 startJREInstall();
               }
            } else {
                // Generate a notification about the failure, but skip the
                // offer to install/upgrade.  This platform don't do that.
                alert( explanation );
            }
        },

        initDtfx: function() {
            // Init error arrays in case of Java problems.
            dtfxObject.errorMessageBoxes = new Array();
            dtfxObject.errorMessageWidths = new Array();
            dtfxObject.errorMessageHeights = new Array();

            // Netscape browsers tend to cache the resultant HTML rather
            // than reprocessing the JavaScript.  But an onunload method stops the page 
            // from getting cached. Sooo...
            window.onunload = function(){appletIdTime = {};};

	    dtfxObject.initErrorMsg();
        }
    };

    // Init the dtfx data.
    dtfxObject.initDtfx();

} // End of include guard

/**
 * This function is used to generate a standard APPLET tag and parameters
 * for use with JavaFX applets.  There are two parameters to this function.
 * The first is used to specify parameters used to start the JNLP
 * associated with the applet (the APPLET tag, and some embedded and additional
 * parameters).  The second is used to specify <param> tags within the APPLET
 * call, with the intent that they get passed to the JavaFX applet.
 *
 * Please note that all examples use "</ script>" to end a script section.  The
 * space should not be used in real code.  It is listed that way here because,
 * even in comments, the actual end script code would end the enclosing script.
 *
 * A typical call to this function would look like this:
 *
 *    <script src="http://dl.javafx.com/dtfx.js"></ script>
 *    <script>
 *        javafx( { width: 200,
 *                  height: 200,
 *                  archive: "http://www.myweb.com/myapp/Test.jar",
 *                  code: "MyTestPackage.TestApplet"
 *                  name: "My Appet - ain't it cool?",
 *                }
 *              );
 *    </ script>
 *
 * The specification of parameters looks a lot like JavaFX, but it is a JavaScript
 * technique referred to as "associative arrays".  The labels will be used as the
 * parameter names, and the data after the colon will be treated as the parameter
 * value.  Any param name can be specified.  If unrecognized, it will be passed to
 * the APPLET tag, which, if invalid, will be ignored.  Tags specifically recognized
 * include:
 *
 * - width - the display width of the applet.
 * - height - the display height of the applet.
 * - name - a title for the applet.
 * - archive - the list of application JARs to use.
 * - code - the name of the applet class to be run.
 * - jnlp_href - the location of the applet's jnlp file.  If not specified, it is
 *               assumed that this file has the same name as the first jar file in
 *               the archive parameter (except with a ".jnlp" extension).
 * - version - the version of JavaFX to use.  If unspecified, the latest version
 *             will be used.
 * - displayHTML - For debug purposes, rather than generating executable HTML code,
 *                 this function will simply display the HTML it would generate on
 *                 the page.
 * - loading_image_url - the url of a customized image for overlay display.  The dimensions
 *                       of this image must also be specified as below.
 * - loading_image_width - the display width of the customized overlay loading image.
 * - loading_image_height - the display height of the customized overlay loading 
 *                          image.
 *
 * A few implementation notes:
 * - The archive passed in will be updated to include the required base JavaFX jars
 *   by the function - there is no need to list them in the call.
 * - Some parameters will be generated with default parameters is they are not
 *   specified.
 * - There is a very simple option to specify the first parameter as a simple string.
 *   In this case, it is assumed the string is the name of the JAR containing the
 *   applet to be run.  For example:
 *
 *    <script src="http://dl.javafx.com/dtfx.js"></ script>
 *    <script>
 *        javafx( "http://www.myweb.com/myapp/Test.jar" );
 *    </ script>
 *
 * - Finally, an example of using the second optional parameter. These parameters
 *   will be inputs to the applet being run:
 *
 *    <script src="http://dl.javafx.com/dtfx.js"></ script>
 *    <script>
 *        javafx( { width: 200,
 *                  height: 200,
 *                  archive: "http://www.myweb.com/myapp/Test.jar"
 *                },
 *                {
 *                  displayAtStart: "http://www.myweb.com/myapp/StartImage.jpg",
 *                  displayUponExit: "http://www.myweb.com/myapp/EndImage.jpg"
 *                }
 *              );
 *    </ script>
 *
 */
function javafx(launchParams, appletParams) {
    //send first ping in 4s, it will setup others
    //only do this for the very first applet on the page
    if (idCounter == 0) {
        window.setTimeout(sendPeriodicPing, 4000);
    }

    // We use the inner string function to keep processing in one place.
    var stringOutput = dtfxObject.javafxString(launchParams, appletParams);
    if (null != stringOutput) {
        document.write(stringOutput);
    }
}

// A function that returns the string for the applet.  Useful for those who 
// want to place JavaFX applet in code more dynamically.
function javafxString(launchParams, appletParams) {
    return dtfxObject.javafxString( launchParams, appletParams );
}

function hideOverlay(id) {
    // remove startup animation if possible else hide it
    var olay = document.getElementById(id + "Overlay");
    if (olay) {
        if (olay.parentNode && olay.parentNode.removeChild) {
            olay.parentNode.removeChild(olay);
        } else {
            olay.style.visibility = "hidden";
        }
        // move applet into place
        document.getElementById(id).style.left = "0px";
    }
}

// Used by the JavaFX applet to remove the up animation to the applet can
// be seen.  Not intended for direct call by the web page's Javascript code.
function fxAppletStarted(id) {
    hideOverlay(id);
    sendPing(id, "done_ok");
}

// Used by the JavaFX progress to remove splash panel
// Not intended for direct call by the web page's Javascript code.
function fxAppletHideSplash(id) {
    hideOverlay(id);
    sendPing(id, "info_splash");
}

function fxAppletFailed(id, reason) {
    hideOverlay(id);
    sendPing(id, "applet_failed_"+reason);
}
