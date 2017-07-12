define('shopping_cart/shopping_cart', [
    'address_editor/address_editor',
    'services'], function() {
  return angular.module('ShoppingCartModule', [
      'AddressEditorModule', 'ServicesModule'])
    .directive('shoppingCart', function(rpc) {
      return {
        scope: {
          cart: '=',
          refill: '@',
          user: '='
        },
        link: function(scope) {
          scope.confirming = false;
          scope.addrEditor = {};
          
          scope.checkOut = function() {
            if (!scope.confirming) {
              scope.confirming = true;
              return;
            }
            var user = scope.user;    
            if (!user.name || !user.street || !user.country) {
              alert('请输入完整收货信息.');
              scope.addrEditor.editing = true;
              return;
            }
            scope.cart.checkOut(user, scope.refill).then(function(placed) {
              if (placed) scope.confirming = false;
            });
          };
        },
        templateUrl : 'js/shopping_cart/shopping_cart.html?tag=201705012131'
      };
    });
});
