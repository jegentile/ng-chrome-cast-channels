# ng-chrome-cast-channels

This AngularJS module simplifies the Chrome Cast API by providing sender and receiver services for simple data transfer
from the Chrome API.

## Before we get started ...

You will need to register and receive an Application ID from the Google Cast SDK Developer Console.
Steps for this are [here](https://developers.google.com/cast/docs/registration#RegisterApp)

## Credits

Before we start, I really do need to thank **naddaf** for the great work [here](https://github.com/googlecast/CastHelloText-chrome)

## Example

This repository has a sample sender and receiver application. The receiver displays strings from tne sender. It should 
work once the application is configured through the Cast SDK Developer Console and the application ID is filled into 
*sender.html*.

## Usage

First, have *ng-chrome-cast-channels.js* and require the module via AngularJS:

```javascript
angular.module('MyApplicationName',[...,'ng-chrome-cast-channels'])
...
```

### Sender

The sender accesses the *SenderServiceChannel* by including a reference when defining its controller:
```javascript
angular.controller('MySenderController',
        ['$scope','ChromeCastSenderChannel',... 
            ,function($scope,ChromeCastSenderChannel,...){
}])
...
```

Then, within the sender controller, a Chromecast session needs to be initialized. This is done by calling the *initialize*
routine and providing the Application ID and namespace. In the example *sender.html*, this is performed here:
```javascript
...
    ChromeCastChannel.initialize('XXXXXXXX','urn:x-cast:com.google.cast.sample.namespace')
...
```
where *'XXXXXXXX'* is your Application ID and *'urn:x-cast:com.google.cast.sample.namespace'* is your namespace.

That's it. Now the sender just needs to send data to the receiver. Messages are sent using the `sendMessage` function on
the service:
```javascript
ChromeCastChannel.sendMessage($scope.message)
```

### Receiver

The receiver channel needs to know the namespace and how to handle new data. This is achieved through the `initialize` function call 
through the ChromeCastReceiverChannel. The first parameter is the namespace followed by a function that is called
when a message is received, where the received data is a parameter to this function:
```javascript
... 
 .controller('myctrl', ['$scope', 'ChromeCastReceiverChannel', function ($scope, ChromeCastReceiverChannel) {
    $scope.callback = function(data){
        $scope.data = data;
        $scope.$apply();
    };
    ChromeCastReceiverChannel.initialize('urn:x-cast:com.google.cast.sample.namespace',$scope.callback)
 }])
 ...
```



