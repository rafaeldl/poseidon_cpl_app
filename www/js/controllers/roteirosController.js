var roteirosController = function($scope, $http) {

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
        $scope.sendingData = true;
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
                });
            });
        });     
    };
    loadRoteiros();
    
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

};