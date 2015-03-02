pedidoController = function($scope, $http, $stateParams) {
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
        var now = new Date();
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
        $scope.pedido.c5_emissao = $helpers.dateToProtheusDate(now);
        $scope.pedido.c5_zhora = $helpers.dateToProtheusTime(now);
        $scope.pedido.__roteiro = roteiro.sequencia;
        $scope.pedido.__total = $scope.total;
        $scope.pedido.c5_hash = $scope.pedido.c5_hash || $helpers.generateHash($scope.pedido);
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
            $scope.pedido.__id = new Date().getTime();
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
            

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    $scope.pedido.c5_zlatitu = position.coords.latitude.toFixedDown(9);
                    $scope.pedido.c5_zlongit = position.coords.longitude.toFixedDown(9);
                    salvaPedido($scope.pedido);
                    $scope.saving = 0;
                    window.location = '#/app/roteiros';
                },
                function(error){
                    salvaPedido($scope.pedido);
					$scope.saving = 0;                    
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
};