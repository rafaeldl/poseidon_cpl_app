applicationController = function($scope, $ionicModal, $timeout, $location, $http) {

  verifyVersion();

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

  /*
   * Send button
   */    
  $scope.sendData = function()
  {
      if (SEND_TIMEOUT){
          clearTimeout(SEND_TIMEOUT);
      }
      $scope.sendModels('pedidos', 'pedido', function(){            
          $scope.sendModels('sem_pedidos', 'sem_pedido', function(){
              //TODO
          });
      });
  };
  $scope.sendModels = function(type, apiModel, success)
  {
      if ($scope.sendingData)
      {
          return 0;
      }
      $scope.sendingData = true;

      /*
       * Clear errors
       */
      var models = $localData.findAll($http, type, false);
      for (var i in models)
      {
          var model = models[i];
          if (model.errors)
          {
              delete model.errors;
          }
      }
      $localData.saveAll(models, type);

      /*
       * Send models
       */
      var send = function(callback)
      {
          models = $localData.findAll($http, type, false);

          /*
           * break condition
           */
          var model = models[0];
          var allWithError = true;
          for (var i in models)
          {
              var errors = models[i].errors;
              if (!errors)
              {
                  allWithError = false;
                  model = models[i];
                  break;
              }
          }
          if (allWithError || (!models.length))
          {
              callback();
              return 0;
          }

          /*
           * Try to send
           */
          var data = $localData.serialize(apiModel, model);
          $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
          $http.post(API_URL+'/'+ type +'.json', data +
              "&user_email="+localStorage['user_email']+"&user_token="+localStorage['user_token'])
              .success(function(){
                  $localData.delete($http, type, '__id', model.__id);
                  $scope.sendingData = false;
                  var roteiro = $localData.find($http, 'roteiros', 'sequencia', model.__roteiro);
                  roteiro['status_'+type] = STATUS_SENT;
                  roteiro.errors = '';
                  $localData.update($http, 'roteiros', 'sequencia', roteiro);
                  send(callback);
              })
              .error(function(data, status, headers, config){
                  if (data.base)
                  {
                      var roteiro = $localData.find($http, 'roteiros', 'sequencia', model.__roteiro);
                      roteiro['status_'+type] = STATUS_SENT_ERROR;
                      roteiro.errors = data.base.join(' ');
                      $localData.update($http, 'roteiros', 'sequencia', roteiro);
                      model.errors = data.base.join(' ');
                      $localData.update($http, type, '__id', model);
                      send(callback);
                  }
                  else
                  {
                      var roteiro = $localData.find($http, 'roteiros', 'sequencia', model.__roteiro);
                      roteiro['status_'+type] = STATUS_SENT_ERROR;
                      roteiro.errors = 'Sem rede';
                      $localData.update($http, 'roteiros', 'sequencia', roteiro);
                      model.errors = 'Sem rede';
                      $localData.update($http, type, '__id', model);
                      $scope.sendingData = false;
                      send(callback);
                  }
              });
      };

      send(function(){
          $scope.sendingData = false;            
          if (success)
          {
              success();    
          }            
      });
  };

  /*
   * Sincroniza em 5 mins
   */
  SEND_TIMEOUT = setTimeout(function(){
      $scope.sendData();
  }, 60000);
};

