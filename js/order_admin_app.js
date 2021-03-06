define('order_admin_app', [
    'app_bar/app_bar',
    'orders/orders',
    'inventory/inventory',
    'users/users',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'OrdersModule',
      'InventoryModule',
      'ServicesModule',
      'PermissionModule',
      'UsersModule',
      'UtilsModule',
      ])
      .directive('body', function($rootScope, rpc, perm, utils) {
        return {
          link: function(scope) {
            rpc.get_user().then(function(user) {
              perm.user = user;
              scope.user = user;
              if (!perm.isAdmin()) {
                utils.login();
              }
            });
            
            scope.isOrderAdmin = function() {
              return perm.isOrderAdmin();
            };

            scope.pageLoaded = [];

            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
       
            tabs.addEventListener('iron-select', function() { 
              scope.pageLoaded[pages.selected = tabs.selected] = true;
              setTimeout(function() {
                scope.$apply();
              }, 0);
            });
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['order_admin_app']);
