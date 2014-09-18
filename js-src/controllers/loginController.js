loginController = function($scope, $http, $ionicSideMenuDelegate, $ionicPlatform) {

    $scope.half = window.innerHeight * 0.3;
    window.onresize = function(){
        var container = document.getElementById('logo-container');
        container.style.top = (window.innerHeight * 0.3)+'px';
    }
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
            alert($scope.errorMessage);
        });
    };
};