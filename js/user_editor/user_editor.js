define('user_editor/user_editor',
    ['services', 'utils',
     'address_editor/address_editor',
     'permission'], function() {
  return angular.module('UserEditorModule', ['ServicesModule',
      'AddressEditorModule',
      'PermissionModule', 'UtilsModule']).directive('userEditor',
          function($rootScope, perm, rpc, utils) {
    return {
      scope: {
        classMates: '=',
        user: '='
      },
      link: function($scope) {
        for (var key in utils) {
          if (key.endsWith('Labels')) {
            $scope[key] = utils[key];
          }
        }
        $scope.getDisplayLabel = function(key) {
          return $scope.user && utils.getDisplayLabel($scope.user, key);
        };

        $scope.isAdmin = function() {
          return perm.isAdmin();
        };

        $scope.$watch('editing', function() {
          if (!$scope.editing) return;
          document.querySelector('div.user-info-editor').scrollIntoView();
          $scope.originalUser = utils.mix_in({}, $scope.user);
          $scope.error = null;
        });

        $scope.save = function(editing) {
          var user = $scope.user;
          var data = {id: user.id};
          editing = editing || $scope.editing;
          switch (editing) {
          case 'address':
            data.street = user.street;
            data.city = user.city;
            data.state = user.state;
            data.country = user.country;
            data.zip = user.zip;
            break;
          case 'password':
            if (user.password != user.confirm) return;
          default:
            data[editing] = user[editing];
            break;
          }
          
          rpc.update_user(data).then(function(response) {
            if (response.data.updated) {
              $scope.editing = null;
              $scope.user.id = $scope.user.id || response.data.updated.id;
            } else {
              utils.mix_in($scope.user, $scope.originalUser);
              $scope.user.confirm = null;
              $scope.error = response.data.error;
            }
          });
        };
      },

      templateUrl : 'js/user_editor/user_editor.html?tag=201711012111'
    };
  });
});
