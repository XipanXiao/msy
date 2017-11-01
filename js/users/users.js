define('users/users', [
    'permission', 'services',
    'user_editor/user_editor',
    'utils'], function() {

  return angular.module('UsersModule', [
    'PermissionModule', 'ServicesModule',
    'UserEditorModule', 'UtilsModule'])
        .directive('users', function($rootScope, perm, rpc, utils) {
      return {
        scope: {
          agentId: '=',
        },
        restrict: 'E',
        link: function($scope) {
          $scope.$watch('agentId', function(agentId) {
            rpc.get_users(null, agentId).then(function(response) {
              $scope.users = response.data;

              $scope.isNotEmpty = !utils.isEmpty($scope.users);

              for (var id in $scope.users) {
                var user = $scope.users[id];
                utils.setCountryLabels(user);
              }
              $scope.editingUser = $scope.editingUser &&
                  utils.firstElement($scope.users, 'id', $scope.editingUser.id);
            });
          });
          $scope.levelLabels = utils.levelLabels;
          $scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          };
          $scope.isAdmin = function(user) {
            return perm.isAdmin();
          };
          $scope.showInfo = function(user, index) {
            $scope.editingUser = user;
            $scope.selectedTop = index * 32;
          };
          $scope.remove = function(user) {
            var message = '请确认删除用户"{0}"({1}).'.format(user.name, 
                user.email);
            if (!confirm(message)) return;

            rpc.remove_user(user.id).then(function(response) {
              if (response.data.deleted) {
                var index = $scope.users.indexOf(user);
                $scope.users.splice(index, 1);
              }
            });
          };
          $scope.selected = function(user) {
            return $scope.editingUser && $scope.editingUser.id === user.id;
          };

          $scope.userCount = function() {
            return $scope.users && utils.keys($scope.users).length;
          };
          
          $scope.addUser = function() {
            var user = {};
            $scope.users.push(user);
            $scope.editingUser = user;
          };
        },
        templateUrl : 'js/users/users.html?tag=201705162307'
      };
    });
});
