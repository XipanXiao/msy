define('app_bar/app_bar', ['permission', 'search_bar/search_bar'], function() {
  return angular.module('AppBarModule', ['PermissionModule', 'SearchBarModule'])
    .directive('appBar', function(perm) {
      return {
        scope: {
          admining: '@',
          user: '='
        },
        link: function(scope) {
          scope.isAdmin = function() {
            return perm.isAdmin();
          };
          scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          };
          scope.isYearLeader = function() {
            return perm.isYearLeader();
          };
          scope.isOrderAdmin = function() {
            return perm.isOrderAdmin();
          };
          scope.showAssignments = function() {
            return perm.isSysAdmin() || perm.isYearLeader();
          };
          scope.isIn = function(page) {
            return location.pathname.endsWith(page);
          };
        },
        templateUrl : 'js/app_bar/app_bar.html?tag=201706041057'
      };
    });
});
