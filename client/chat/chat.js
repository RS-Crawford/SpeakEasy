angular.module('speakEasy.chat', [])

.factory('ChatFactory', function ($http, $location, $window) {
  // Your code here
  var serveMessage = function (message) {
    console.log('ChatFactory serveMessage', message);
    return $http({
      method: 'POST',
      url: '/api/chat/chat',
      data: message
    })
    .then(function (resp) {
      console.log('response in ChatFact.serveMsg', resp.data)
      return resp.data;
    });
  }

  return {
    serveMessage: serveMessage
  };
})

.controller('ChatCtrl', ['$scope','$mdDialog', '$mdMedia', '$state', '$window', '$rootScope', 'ChatFactory', function ($scope, $mdDialog, $mdMedia, $state, $window, $rootScope, ChatFactory) {
  // find chatBox in our HTML to append onto it later
  var chatBox = angular.element(document.querySelector('.chatBox'));
  // find chatWrap to ensure proper scrolling later
  var chatWrap = angular.element(document.querySelector('.chatBoxWrap'));
  $scope.message = {};
  $scope.sendMessage = function () {
    var jwt = $window.localStorage.getItem('com.speakEasy');
    if (jwt) {
      console.log('theres jwt!!')
      console.log('sending message!', $scope.message);

      $scope.renderMessage('user', $scope.message.text);

      ChatFactory.serveMessage($scope.message)
        .then(function (data) {
          // this resets message to blank and also clears the message field
          $scope.message = {};
          console.log('then function from ChatCtrl serveMsg call', data);
          $scope.renderMessage('robot', data);
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      //$scope.goToLogin();
      $rootScope.$broadcast('noJwtChat');
    }
  }

  $scope.renderMessage = function (context, message) {
    // context is either 'user' or 'robot', defining the origin of the message
    message.replace(/^\s*$/g, ''); // FUTZ WITH REGEX
    if ( message.length === 0 ) {
      $scope.message = {};
      return;
    }

    var messageElement = '<div flex class="messageWrap"><div ';
    
    if ( context === 'user' ) {
      // With context of 'user' we give the element class userMessage.
      messageElement += 'class="userMessage">';
    } else if ( context === 'robot' ) {
      // With context of 'robot' we give the element class robotMessage.
      // These two class types define separate styling
      messageElement += 'class="robotMessage">';
    }

    messageElement += ('<p>' + message + '</p></div></div>');

    chatBox.append(messageElement);
    
    // This makes sure the chatbox follows new messages as they cause overflow
    chatWrap[0].scrollTop = chatWrap[0].scrollHeight;
  }

}]);
