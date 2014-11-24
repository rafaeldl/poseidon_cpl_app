applicationController = function($scope, $ionicModal, $timeout, $location) {

  if (window.SEND_TIMEOUT)
  {
     clearTimeout(SEND_TIMEOUT);
  }

  // Form data for the login modal
  $scope.loginData = {};
  $scope.appVersion = APP_VERSION;

  // App logoff
  $scope.doLogoff = function(){
     if (!confirm('Deseja mesmo sair? Seus dados serão perdidos.')){
       return 0;
     }
     localStorage.clear();
     window.location = '#/app/login';
  };  

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  /*
   * Access control
   */  
  if (
    ($location.path() != '/app/login') &&
    ((!localStorage['user_email']) ||
     (!localStorage['user_token']))
  )
  {
      window.location = '#/app/login';
  }
};