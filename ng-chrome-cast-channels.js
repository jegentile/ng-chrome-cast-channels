/**
 * Created by jgentile on 2/9/15.
 */

angular.module('ng-chrome-cast-channels',[])
    .service('ChromeCastSenderChannel',function() {

        var session = null;
        var my_namespace = null

        function sessionUpdateListener(isAlive) {
            var message = isAlive ? 'Session Updated' : 'Session Removed';
            message += ': ' + session.sessionId;

            if (!isAlive) {
                session = null;
            }
        };

        function receiverMessage(namespace, message) {
            console.log("receiverMessage: " + namespace + ", " + message);
        };
        function onSuccess(message) {
            console.log("onSuccess: " + message);
        }
        function on_error(e){
            console.log('error',e)
        }

        sendMessage = function (message) {

            console.log('Sending!!!', message, session)
            if (session != null) {
                session.sendMessage(my_namespace, message, onSuccess.bind(this, "Message sent: " + message), on_error);
            }
            else {
                chrome.cast.requestSession(function (e) {
                    session = e;
                    session.sendMessage(my_namespace, message, onSuccess.bind(this, "Message sent: " + message), on_error);
                }, on_error);
            }
        };

        this.sendMessage = sendMessage;

        this.initialize = function (appId, namespace) {
            my_namespace = namespace

            initializeCastApi = function () {

                //var sessionRequest = new chrome.cast.SessionRequest('0B02BF1F');
                var sessionRequest = new chrome.cast.SessionRequest(appId);
                console.log('session request', sessionRequest)
                var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                    sessionListener,
                    function (r) {
                        console.log('receiver listener', r)
                    });

                chrome.cast.initialize(apiConfig,
                    function () {
                        console.log('inint success')
                    },
                    function (err) {
                        console.log('!!!!!!!!!!!!! API init erred', err)
                    });


                function sessionListener(e) {
                    console.log('this is:', this)
                    console.log('New session ID:' + e.sessionId);
                    session = e;
                    session.addUpdateListener(sessionUpdateListener);
                    session.addMessageListener(my_namespace, receiverMessage);
                    //sendMessage('hello')
                }

            };

            window['__onGCastApiAvailable'] = function (loaded, errorInfo) {
                if (loaded) {
                    initializeCastApi()
                } else {
                    console.log(errorInfo);
                }
            };

            return

        };


        return this;
    })
    .service('ChromeCastReceiverChannel', function () {
        this.initialize = function(namespace,callback) {
            window.onload = function () {

                cast.receiver.logger.setLevelValue(0);
                window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
                console.log('Starting Receiver Manager');

                // handler for the 'ready' event
                castReceiverManager.onReady = function (event) {
                    console.log('Received Ready event: ' + JSON.stringify(event.data));
                    window.castReceiverManager.setApplicationState("Application status is ready...");
                };

                // handler for 'senderconnected' event
                castReceiverManager.onSenderConnected = function (event) {
                    console.log('Received Sender Connected event 22: ' + event.data);
                    console.log(window.castReceiverManager.getSender(event.data).userAgent);
                };

                // handler for 'senderdisconnected' event
                castReceiverManager.onSenderDisconnected = function (event) {
                    console.log('Received Sender Disconnected event: ' + event.data);
                    if (window.castReceiverManager.getSenders().length == 0) {
                        window.close();
                    }
                };

                // handler for 'systemvolumechanged' event
                castReceiverManager.onSystemVolumeChanged = function (event) {
                    console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
                        event.data['muted']);
                };

                // create a CastMessageBus to handle messages for a custom namespace
                window.messageBus =
                    window.castReceiverManager.getCastMessageBus(
                        'urn:x-cast:com.google.cast.sample.helloworld');


                window.messageBus.onMessage = function (event) {
                    console.log('Message [' + event.senderId + ']: ' + event.data);
                    // display the message from the sender
                    callback(event.data);
                    // inform all senders on the CastMessageBus of the incoming message event
                    // sender message listener will be invoked
                    window.messageBus.send(event.senderId, event.data);
                }

                // initialize the CastReceiverManager with an application status message
                window.castReceiverManager.start({statusText: "Application is starting"});
                console.log('Receiver Manager started');
            }
        };

        return this;

    });
