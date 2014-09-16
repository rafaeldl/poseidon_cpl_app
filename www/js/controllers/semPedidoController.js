semPedidoController = function($scope, $http, $stateParams) {
    $scope.inEdition = $stateParams['semPedidoId'];
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
        var salvaSemPedido = function(semPedido)
        {
            if ($scope.inEdition != '0')
            {
                $localData.update($http, 'sem_pedidos', '__id', semPedido);
            }
            else
            {
                semPedido.__id = new Date().getTime();
                $localData.saveAll(list, 'sem_pedidos');
            }
        };
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
                    salvaSemPedido($scope.sem_pedido);
                    window.location = '#/app/roteiros';
                },
                function(error){
                    salvaSemPedido($scope.sem_pedido);
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
            salvaSemPedido($scope.sem_pedido);
            window.location = '#/app/roteiros';
        }
    }

    /*
     * Carrega sem pedido para edição
     */
    if ($scope.inEdition != '0')
    {        
        $scope.sem_pedido = $localData.find($http, 'sem_pedidos', '__id', $scope.inEdition);
        var evento = document.getElementById('input-evento');        
        
        // FIXME
        setTimeout(function(){            
            evento.value = $scope.sem_pedido.ad5_evento;
        }, 500);
    }    
};