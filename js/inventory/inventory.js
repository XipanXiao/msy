define('inventory/inventory', [
    'model/cart',
    'editable_label/editable_label',
    'orders/orders',
    'shopping_cart/shopping_cart', 
    'services', 'utils'], function(Cart) {
  return angular.module('InventoryModule', [
        'EditableLabelModule',
        'OrdersModule',
        'ShoppingCartModule',
        'ServicesModule',
        'UtilsModule'])
    .directive('inventory', function($rootScope, rpc, utils) {
      return {
        scope: {
          user: '='
        },
        link: function(scope) {
          scope.year = new Date().getFullYear();
          scope.cart = new Cart({rpc: rpc, utils: utils,
              rootScope: $rootScope});

          function getCategories() {
            return rpc.get_item_categories().then(function(response) {
              return scope.categories = response.data;
            });
          }
          
          function getItems() {
            return rpc.get_items().then(function(response) {
              return scope.items = utils.toList(response.data);
            });
          }
          
          scope.save = function(item) {
            rpc.update_item({id: item.id, inventory_cn: item.inventory_cn,
                inventory_us: item.inventory_us});
          };
          
          utils.requestOneByOne([getCategories, getItems]);
        },
        templateUrl : 'js/inventory/inventory.html?tag=201707032246'
      };
    });
});
