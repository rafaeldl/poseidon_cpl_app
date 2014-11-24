applicationController = function($scope, $ionicModal, $timeout, $location) {
    if (window.SEND_TIMEOUT) {
        clearTimeout(SEND_TIMEOUT);
    }
    $scope.loginData = {};
    $scope.appVersion = APP_VERSION;
    $scope.doLogoff = function() {
        if (!confirm("Deseja mesmo sair? Seus dados serão perdidos.")) {
            return 0;
        }
        localStorage.clear();
        window.location = "#/app/login";
    };
    $ionicModal.fromTemplateUrl("templates/login.html", {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };
    $scope.login = function() {
        $scope.modal.show();
    };
    $scope.doLogin = function() {
        console.log("Doing login", $scope.loginData);
        $timeout(function() {
            $scope.closeLogin();
        }, 1e3);
    };
    if ($location.path() != "/app/login" && (!localStorage || !localStorage["user_email"] || !localStorage["user_token"])) {
        window.location = "#/app/login";
    }
};