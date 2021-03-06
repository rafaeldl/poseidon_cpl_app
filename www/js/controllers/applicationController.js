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
              $scope.loadRoteiros();
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

  /**
   * Update data
   */
  $scope.updateData = function(){
      if ($scope.sendingData){
         alert('Aguarde o término da sincronia');
         return 0;
      }
      // Atualizando tabela de preços
      $localData.findAll($http, 'roteiros', false, function(response){
          $scope.listItens = response.data;          
          var tabelas = [],
              item;               
          for (var i in $scope.listItens)
          {
              item = $scope.listItens[i];
              if (tabelas.indexOf(item.tabela) == -1)
              {
                  tabelas.push(item.tabela);
                  $localData.findAll($http, 'produtos', true, null, 
                      'tabela='+item.tabela, 'produtos-'+item.tabela);
              }
          }
      });
  };

  $scope.updateData = function(){
     if ($scope.updatingData || $scope.sendingData){
        alert('Aguarde as atualizações anteriores');
        return 0;
     }
     $scope.updatingData = true;
     $scope.loadRoteiros(true, function(){
        alert('Dados atualizados com sucesso!');
        $scope.updatingData = false;
     });
  };

  /**
   * Habilita próximo roteiro
   */
  $scope.enableNext = function(list)
  {
      for (var i in list)
      {
          var item = list[i];
          item.done = true;
          if ((!(item['status_pedidos'] || item['status_sem_pedidos'])) && !item['liberado'])
          {
              break;
          }
      }
  };

  /**
   * Carrega dados complementares e roteiro
   */
  $scope.loadRoteiros = function(updateData, loadRoteirosCallback)
  {
      console.log('Load roteiros');
      /*
       * Verifica a data do roteiro TODO REMOVE IT
       */
      var lastUpdate = localStorage['sync_roteiros'],
          forceUpdate =  false;

      if (!forceUpdate && lastUpdate)
      {
          var today = new Date();
          var lastUpdate = new Date(parseInt(localStorage['sync_roteiros']));
          if (lastUpdate.getDate() < today.getDate())
          {
              forceUpdate = true;
          }
      }
      else
      {
          forceUpdate = true;
      }
      $scope.sendingData = true;
      $scope.loading = true;
      $localData.findAll($http, 'roteiros', forceUpdate, function(response){
          $scope.listItens = response.data;
          $scope.enableNext($scope.listItens);
          $scope.loading = false;
          // Apenas atualiza dados do produto e não limpa roteiros
          forceUpdate = forceUpdate || updateData;
          var tabelas = [], 
              item,
              emptyList;                       
          for (var i in $scope.listItens)
          {                
              item = $scope.listItens[i];
              if (tabelas.indexOf(item.tabela) == -1)
              {
                  tabelas.push(item.tabela);
                  $localData.findAll($http, 'produtos', forceUpdate, null, 
                      'tabela='+item.tabela, 'produtos-'+item.tabela);
              }
          }

          // Clean default querie data when force
          if (forceUpdate){
             emptyList = '[]';
             localStorage['consulta-AC5'] = emptyList;
             localStorage['consulta-Z1'] = emptyList;
             localStorage['consulta-SE4'] = emptyList;
             localStorage['consulta-ZJ2'] = emptyList;
             localStorage['consulta-SA1'] = emptyList;     
          }

          /*
           * Carrega Evetos
           */
          $localData.defaultQuery($http, 'AC5', function(response){
              $localData.saveAll(response.data, 'eventos');

              /*
               * Carrega Familias de produtos
               */
              $localData.defaultQuery($http, 'Z1', function(response){
                  $localData.saveAll(response.data, 'produto-familias');

                  /*
                   * Carrega condições de pagamento
                   */
                  $localData.defaultQuery($http, 'SE4', function(response) {
                      $localData.saveAll(response.data, 'condicao-pagamento');

                      /*
                       * Carrega forma de recebimento
                       */
                      $localData.defaultQuery($http, 'ZJ2', function(response) {
                          $localData.saveAll(response.data, 'forma-recebimento');

                          /*
                           * Carrega Clientes
                           */
                          if ($scope.listItens.length)
                          {
                              var percurso = $scope.listItens[0]['percurso'];
                              $localData.defaultQuery($http, 'SA1', function(response) {
                                  $localData.saveAll(response.data, 'clientes');
                                  $scope.sendingData = false;
                              }, 'filter=a1_zrota:'+percurso);
                          }
                          else
                          {
                              $scope.sendingData = false;
                          }

                          if (loadRoteirosCallback){
                              loadRoteirosCallback();
                          }
                      });
                  });
              });
          });
      });     
  };

  /*
   * Sincroniza em 5 mins
   */
  SEND_TIMEOUT = setTimeout(function(){
      $scope.sendData();
  }, 60000);
};

