var roteirosController = function($scope, $http) {

    $scope.hideBackButton = true;

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
            localStorage['sem_pedidos'] = '[]';
        }
    }
    else
    {
        localStorage['load_date'] = "" + new Date().getTime();
    }

    var loadRoteiros = function(loadRoteirosCallback)
    {
        console.log('Load roteiros');
        /*
         * Verifica a data do roteiro TODO REMOVE IT
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
     * Sincroniza ao salvar
     */
    if (window.syncronize)
    {
        loadRoteiros(function(){
            $scope.$parent.sendData();    
        });        
    }
    else
    {
        loadRoteiros();
    }

    

};