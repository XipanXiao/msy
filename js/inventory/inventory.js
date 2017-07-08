define('inventory/inventory', [
    'editable_label/editable_label', 'services', 'utils'], function() {
  return angular.module('InventoryModule', [
        'EditableLabelModule',
        'ServicesModule',
        'UtilsModule'])
    .directive('inventory', function(rpc, utils) {
      return {
        link: function(scope) {
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
