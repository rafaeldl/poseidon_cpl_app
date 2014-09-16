angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location) {

  if (window.SEND_TIMEOUT)
  {
     clearTimeout(SEND_TIMEOUT);
  }

  // Form data for the login modal
  $scope.loginData = {};

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
  if
      (
        ($location.path() != '/app/login') &&
        ((!localStorage) ||
        (!localStorage['user_email']) ||
        (!localStorage['user_token']))
      )
  {
      window.location = '#/app/login';
  }
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('LoginCtrl', function($scope, $http, $ionicSideMenuDelegate) {

    $ionicSideMenuDelegate.canDragContent(false);
    $scope.errorMessage = '';
    $scope.email = localStorage['user_email'] || '';
    $scope.password = '';
    localStorage.clear();
    localStorage['user_email'] = $scope.email;

    $scope.doLogin = function()
    {
        if ($scope.doing)
        {
            return 0;
        }
        $scope.doing = true;
        var email = this.email;
        var password = this.password;
        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        $http.post(API_URL +'/api/v1/tokens.json',
            "email="+email+"&password="+password)

        .success(function(response){
                localStorage['user_token'] = response.token;
                localStorage['user_email'] = email;
                window.location = '#/app/roteiros';
        })
        .error(function(data, status, headers, config){
            $scope.doing = false;
            if ((status == 401) || (status == 400))
            {
                $scope.errorMessage = 'Email ou senha inválido.';
            }
            else
            {
                $scope.errorMessage = 'Erro ao acessar o servidor.';
            }
        });
    };
})

.controller('PedidoListCtrl', function($scope, $http, $stateParams) {
    $scope.pedidos = $localData.findAll($http, 'pedidos');
    $scope.roteiros = {};    
    $scope.helpers = $helpers;    
    $scope.deleteItem = function(pedido)
    {
        if (!confirm('Deseja mesmo excluir este pedido?'))
        {
            return 0;
        }        
        var roteiro = $scope.roteiros[pedido.__roteiro];
        roteiro.status_pedidos = STATUS_NOT_SENT;
        roteiro.errors = '';
        $localData.update($http, 'roteiros', 'sequencia', roteiro);
        $localData.delete($http, 'pedidos', '__id', pedido.__id);
        $scope.pedidos = $localData.findAll($http, 'pedidos');        
    };
    var roteiro;
    for (var i in $scope.pedidos)
    {
        roteiro = $scope.pedidos[i].__roteiro;
        $scope.roteiros[roteiro] = $localData.find($http, 'roteiros', 'sequencia', roteiro);        
    }
})

.controller('PedidoCtrl', function($scope, $http, $stateParams) {
    $scope.inEdition = $stateParams['pedidoId'];
    $scope.helpers = $helpers;
    $scope.roteiro = $localData.find($http, 'roteiros', 'sequencia', $stateParams['roteiroId']);
    $scope.pedido = {c5_tipoped: 'N', c5_prtabel: '', c5_limpeza: ''};
    $scope.produtos = $localData.findAll($http, 'produtos-'+$scope.roteiro.tabela, false);
    $scope.showProdutos = false;
    $scope.produtoFamilia = $localData.findAll($http, 'produto-familias', false);
    $scope.total = 0;
    $scope.changeQtd = function(produto, value)
    {
        if (navigator && navigator.notification)
        {
            navigator.notification.vibrate(20);
        }
        var result = produto.qtd + value;
        if (result)
        {
            produto.qtd += value;
            $scope.itemOk();
        }        
    }
    $scope.deleteItem = function(produto)
    {
        if (!confirm('Deseja excluir o produto '+ produto.descricao +'?'))
        {
            return 0;
        }
        produto.qtd = 0;
        $scope.itemOk();
    }
    $scope.addItem = function()
    {
        $scope.showProdutos = true;
    };
    $scope.itemOk = function()
    {
        $scope.showProdutos = false;
        $scope.total = 0;
        var produto;
        for (var i in $scope.produtos)
        {
            produto = $scope.produtos[i];
            if (produto.qtd)
            {
                $scope.total += (produto.qtd * produto.preco);
            }
        }
    };
    $scope.filterQtd = function(model)
    {
        return model.qtd > 0;
    };
    $scope.save = function()
    {
        if ($scope.saving)
        {
            return 0;
        }
        var roteiro = $scope.roteiro;
        if (!roteiro)
        {
            $scope.saving = 0;
            alert('Roteiro inválido');
            return 0;
        }
        roteiro['status_pedidos'] = STATUS_NOT_SENT;
        $scope.saving = true;
        $scope.pedido.pedido_items = [];
        $scope.pedido.c5_cliente = roteiro.cliente;
        $scope.pedido.c5_lojacli = roteiro.lojacli;
        $scope.pedido.c5_condpag = roteiro.condpag;
        $scope.pedido.c5_tabela = roteiro.tabela;
        $scope.pedido.c5_zfrec = roteiro.zfrec;
        $scope.pedido.__roteiro = roteiro.sequencia;
        $scope.pedido.__total = $scope.total;
        for (var i in $scope.produtos)
        {
            var item = $scope.produtos[i];
            if (item.qtd)
            {
                $scope.pedido.pedido_items.push({
                    c6_produto: item.codigo,
                    c6_um: item.um,
                    c6_qtdven: item.qtd
                });
            }
        }

        /*
         * Validation
         */
        if (!$scope.pedido.pedido_items.length)
        {
            $scope.saving = 0;
            alert('Para prosseguir, insira itens no pedido');
            return 0;
        }
        else
        {
            var valid = true;
            for (var i in $scope.pedido)
            {
                if (i == 'c5_mennota') continue;
                valid = valid && $scope.pedido[i];
            }
            if (!valid)
            {
                $scope.saving = 0;
                alert('Preencha todos os dados do pedido');
                return 0;
            }
        }

        $localData.update($http, 'roteiros', 'sequencia', roteiro);
        var list = $localData.findAll($http, 'pedidos', false);

        if (!$scope.inEdition)
        {
            $scope.pedido.__id = list.length+1;
            list.push($scope.pedido);    
        }

        var salvaPedido = function(pedido)
        {
            if ($scope.inEdition)
            {
                $localData.update($http, 'pedidos', '__id', pedido);   
            }
            else
            {
                $localData.saveAll(list, 'pedidos');
            }
        };

        window.syncronize = true;
        if (navigator && navigator.geolocation)
        {
            $scope.saving = 0;

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    $scope.pedido.c5_zlatitu = position.coords.latitude.toFixedDown(9);
                    $scope.pedido.c5_zlongit = position.coords.longitude.toFixedDown(9);
                    salvaPedido($scope.pedido);
                    window.location = '#/app/roteiros';
                },
                function(error){
                    salvaPedido($scope.pedido);
                    window.location = '#/app/roteiros';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 600000
                }
            );
        }
        else
        {
            salvaPedido($scope.pedido);
            window.location = '#/app/roteiros';
        }
    };

    /*
     * Carrega pedido para edição
     */
    if ($scope.inEdition != '0')
    {        
        $scope.pedido = $localData.find($http, 'pedidos', '__id', $scope.inEdition);
        $scope.total = $scope.pedido.__total;
        var item;
        for (var i in $scope.pedido.pedido_items)
        {
            item = $scope.pedido.pedido_items[i];
            for (var j in $scope.produtos)
            {
                if ($scope.produtos[j].codigo == item.c6_produto)
                {
                    $scope.produtos[j].qtd = item.c6_qtdven;
                }
            }
        }
    }
    else
    {
        $scope.inEdition = false;
    }
})

.controller('RoteirosCtrl', function($scope, $http) {

    $scope.hideBackButton = true;

    $scope.enableNext = function(list)
    {
        for (var i in list)
        {
            var item = list[i];
            item.done = true;
            if (!(item['status_pedidos'] || item['status_sem_pedidos']))
            {
                break;
            }
        }
    };

    if (localStorage['load_date'])
    {
        var date = new Date();
        date.setTime(parseInt(localStorage['load_date']));
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        if (date.getTime() < today.getTime())
        {
            localStorage['roteiros'] = '[]';
            localStorage['pedidos'] = '[]';
        }
    }

    var loadRoteiros = function()
    {
        /*
         * Verifica a data do roteiro
         */
        var lastUpdate = localStorage['sync_roteiros'],
            forceUpdate =  false;

        if (lastUpdate)
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
        $scope.sendingData = false;
        $scope.loading = true;
        $localData.findAll($http, 'roteiros', forceUpdate, function(response){
            $scope.listItens = response.data;
            $scope.enableNext($scope.listItens);
            $scope.loading = false;
            var tabelas = [], 
                item;            
            for (var i in $scope.listItens)
            {                
                item = $scope.listItens[i];
                if (tabelas.indexOf(item.tabela) == -1)
                {
                    tabelas.push(item.tabela);
                    $localData.findAll($http, 'produtos', false, null, 
                        'tabela='+item.tabela, 'produtos-'+item.tabela);
                }
            }        
        });     
    };
    loadRoteiros();


    $localData.findAll($http, 'clientes', false);

    $localData.defaultQuery($http, 'AC5', function(response){
        $localData.saveAll(response.data, 'eventos');
    });

    $localData.defaultQuery($http, 'Z1', function(response){
        $localData.saveAll(response.data, 'produto-familias');
    });

    /*
     * Send button
     */
    var sendButton = document.createElement('button');
    sendButton.classList.add('ion-loop');
    sendButton.style.position = 'absolute';
    sendButton.style.right = '8px';
    sendButton.style.top = '8px';
    var header = document.getElementsByTagName('ion-nav-bar')[0];
    //header.appendChild(sendButton);
    $scope.sendingData = false;
    $scope.sendData = function()
    {
        $scope.sendModels('pedidos', 'pedido', function(){
            $scope.sendModels('sem_pedidos', 'sem_pedido');
        });
    };
    $scope.sendModels = function(type, apiModel, success)
    {
        if ($scope.sendingData)
        {
            return 0;
        }
        $scope.sendingData = true;

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
                        send(callback);
                    }
                });
        };

        send(function(){
            $scope.sendingData = false;
            loadRoteiros();
            if (success)
            {
                success();    
            }            
        });
    };

    /*
     * Sincroniza ao salvar
     */
    if (window.syncronize)
    {
        $scope.sendData();
    }

    /*
     * Sincroniza em 5 mins
     */
    var SEND_TIMEOUT = setTimeout(function(){
        $scope.sendData();
    }, 60000);

})

.controller('RoteiroOpcoesCtrl', function($scope, $http, $stateParams) {
    $scope.roteiroId = $stateParams['roteiroId'];
    $scope.roteiro = $localData.find($http, 'roteiros', 'sequencia', $scope.roteiroId);
    $scope.$helpers = $helpers;
})

.controller('SemPedidoCtrl', function($scope, $http, $stateParams) {
    $scope.roteiro = $stateParams['roteiroId'];
    $scope.sem_pedido = {};
    $scope.eventos = $localData.findAll($http, 'eventos', false);
    $scope.save = function()
    {
        if ($scope.saving)
        {
            return 0;
        }
        $scope.saving = true;
        var obs = document.getElementById('input-obs');
        var evento = document.getElementById('input-evento');
        var roteiro = $localData.find($http, 'roteiros', 'sequencia', $scope.roteiro);

        /*
         * Valida
         */
        if ((!obs.value) || (!evento.value))
        {
            alert('Preencha todos os campos para salvar');
            $scope.saving = false;
            return 0;
        }

        /*
         * Adiciona sem pedido
         */
        var list = $localData.findAll($http, 'sem_pedidos');
        $scope.sem_pedido.ad5_evento = evento.value;
        $scope.sem_pedido.ad5_obs = obs.value;
        $scope.sem_pedido.__roteiro = roteiro.sequencia;
        $scope.sem_pedido.ad5_vend = roteiro.vendedor;
        $scope.sem_pedido.ad5_codcli = roteiro.cliente;
        $scope.sem_pedido.ad5_loja = roteiro.lojacli;
        list.push($scope.sem_pedido);

        /*
         * Salvar
         */
        roteiro['status_sem_pedidos'] = STATUS_NOT_SENT;
        $localData.update($http, 'roteiros', 'sequencia', roteiro);
        syncronize = true;

        if (navigator && navigator.geolocation)
        {
            $scope.saving = 0;

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    $scope.sem_pedido.ad5_zlatit = position.coords.latitude.toFixedDown(9);
                    $scope.sem_pedido.ad5_longit = position.coords.longitude.toFixedDown(9);
                    $localData.saveAll(list, 'sem_pedidos');
                    window.location = '#/app/roteiros';
                },
                function(error){
                    $localData.saveAll(list, 'sem_pedidos');
                    window.location = '#/app/roteiros';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 600000
                }
            );
        }
        else
        {
            $localData.saveAll(list, 'sem_pedidos');
            window.location = '#/app/roteiros';
        }
    }
})

/*
 * Sincronias
 */
.controller('SincroniasCtrl', ['$scope', '$stateParams', '$http',
        function($scope, $stateParams, $http) {

    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $http.post('http://192.168.25.11:3000/api/v1/tokens.json',
        "email=admin@somadl.com.br&password=admin123")

    .then(function(response){

            localStorage['user_token'] = response.data.token;
            localStorage['user_email'] = 'admin@somadl.com.br';

            $http.get(ROTEIROS_URL, {params:{user_email: localStorage['user_email'],
                user_token: localStorage['user_token']}}).then(function(response) {

                $scope.syncCount++;
                $localData.saveAll(response.data, 'roteiros');
                $scope.syncDone();
            });

    });

    $scope.listItens = $localData.findAll('sincronias');
    $scope.doing = false;
    /*
     * ação de sincronizar
     */
    $scope.syncCount = 0;
    $scope.syncDone = function()
    {
        if ($scope.syncCount == 2)
        {
            $scope.syncCount = 0;
            $scope.doing = false;
            $scope.listItens.push({
                date: $helpers.dateToPtBr(new Date(), true)
            });
            $localData.saveAll($scope.listItens, 'sincronias');
        }
    };
    $scope.sync = function()
    {
        var syncronize = function()
        {
            if (!confirm('Deseja mesmo sincronizar com o servidor ?'))
            {
                return 0;
            }

            $scope.doing = true;

            /*
             * Roteiros
             */
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http.post('http://localhost/dl_proxy.php', "user[email]=aaa&user[password]=ccc")
            .then(function(response){
               console.log(response);
            });
            /*$http.get(ROTEIROS_URL).then(function(response) {
                $scope.syncCount++;
                $localData.saveAll(response.data, 'roteiros');
                $scope.syncDone();
            });

            $http.get(PRODUTOS_URL).then(function(response) {
                $scope.syncCount++;
                $localData.saveAll(response.data, 'produtos');
                $scope.syncDone();
            });*/
        };

        // Criar login aqui e chamar o syncronize como callback
        syncronize();
    }


}]);


