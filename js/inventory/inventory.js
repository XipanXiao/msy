define('inventory/inventory', [
    'model/cart',
    'editable_label/editable_label',
    'inventory_history/inventory_history',
    'orders/orders',
    'shopping_cart/shopping_cart',
    'services', 'utils'], function(Cart) {
  return angular.module('InventoryModule', [
        'EditableLabelModule',
        'InventoryHistoryModule',
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
          var cn = scope.cn = 'cn';
          var us = scope.us = 'us';
          scope.year = new Date().getFullYear();
          scope.cart = new Cart({rpc: rpc, utils: utils,
              rootScope: $rootScope});
          scope.selected = {};

          function getCategories() {
            return rpc.get_item_categories().then(function(response) {
              return scope.categories = response.data;
            });
          }
          
          function getItems() {
            return rpc.get_items().then(function(response) {
              scope.items = [];
              utils.forEach(response.data, function(item) {
                item.cost0 = item.price;
                item.cost = item['cost' + scope.user.level];
                scope.items.push(item);
              });
              return scope.items;
            });
          }

          function itemDelta(item, country) {
            return item['inventory_' + country] - 
                item['saved_inventory_' + country];
          }

          scope.changed = function(item) {
            item.dirty = itemDelta(item, cn) || itemDelta(item, us);
            setTimeout(function() {
              scope.$apply();
            }, 0);
          };
          
          scope.isDirty = function() {
            return (scope.items || []).some(function(item) {
              return item.dirty;
            });
          };
          
          scope.cancel = function() {
            scope.items.forEach(function(item) {
              item['inventory_' + cn] = item['saved_inventory_' + cn]; 
              item['inventory_' + us] = item['saved_inventory_' + us];
              item.dirty = false;
            });
          };
          
          scope.save = function() {
            var requests = [];
            scope.items.forEach(function(item) {
              requests.push(saveRequest(item, cn));
              requests.push(saveRequest(item, us));
            });
            utils.requestOneByOne(requests);
          };
          
          window.onbeforeunload = function() {
            return scope.isDirty() ? 'Dirty' : null;
          };

          function saveRequest(item, country) {
            var delta = itemDelta(item, country);
            return function() {
              if (!delta) return utils.truePromise();
              return rpc.update_inventory(item.id, country, delta)
                .then(function(response) {
                  if (response.data.updated) {
                    item['saved_inventory_' + country] = 
                        item['inventory_' + country];
                    scope.changed(item);
                    return true;
                  }
                });
            }
          };

          function getInventory() {
            return rpc.get_inventory().then(function(response) {
              var items = {};
              scope.items.forEach(function(item) {
                items[item.id] = item;
              });
              (response.data || []).forEach(function(inventory) {
                inventory.country = (inventory.country || '').toLowerCase();
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
        templateUrl : 'js/inventory/inventory.html?tag=201712232246'
      };
    });
});
