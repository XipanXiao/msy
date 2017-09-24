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
          
          scope.save = function(item, country) {
            var delta = item['inventory_' + country] -
                item['saved_inventory_' + country];
            rpc.update_inventory(item.id, country, delta)
                .then(function(response) {
                  if (response.data.updated) {
                    item['saved_inventory_' + country] = 
                        item['inventory_' + country];
                  }
                });
          };

          function getInventory() {
            return rpc.get_inventory().then(function(response) {
              var items = {};
              scope.items.forEach(function(item) {
                items[item.id] = item;
              });
              (response.data || []).forEach(function(inventory) {
                var item = items[inventory.item_id];
                item['inventory_' + inventory.country] =
                    parseInt(inventory.count);
                item['saved_inventory_' + inventory.country] =
                    parseInt(inventory.count);
              });
            });
          }
          
          scope.addToCart = function(item) {
            var inventryItem = utils.mix_in({}, item);
            inventryItem.price = inventryItem.cost;
            scope.cart.add(inventryItem);
          };
          
          function reload() {
            utils.requestOneByOne([getCategories, getItems, getInventory]);
          }
          
          $rootScope.$on('reload-orders', reload);
          reload();
        },
        templateUrl : 'js/inventory/inventory.html?tag=201707032246'
      };
    });
});
