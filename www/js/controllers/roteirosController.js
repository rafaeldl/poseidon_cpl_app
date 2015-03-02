var roteirosController = function($scope, $http) {

    $scope.hideBackButton = true;
    
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
            localStorage['load_date'] = "" + new Date().getTime();
        }
    }
    else
    {        
        localStorage['load_date'] = "" + new Date().getTime();
    }

    /*
     * Sincroniza ao salvar
     */
    if (window.syncronize)
    {
        $scope.$parent.loadRoteiros(false, function(){
            $scope.$parent.sendData();    
        });        
    }
    else
    {
        $scope.$parent.loadRoteiros(false);
    }

    

};