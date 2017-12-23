define('inventory_history/inventory_history', [
    'services', 'utils'], function(Cart) {
  return angular.module('InventoryHistoryModule', [
        'ServicesModule',
        'UtilsModule'])
    .directive('inventoryHistory', function(rpc, utils) {
      return {
        scope: {
          item: '='
        },
        link: function(scope) {
          scope.countries = ["CN", "US"];
          scope.$watch("item", reload);
          function reload(item) {
            rpc.get_inventory_history(item.id).then(function(response) {
              scope.history = response.data;

              var balance = {"CN": 0, "US": 0};
              scope.history.items.forEach(function(item) {
                var order = scope.history.orders[item.order_id];
                item.name = order.name;
                item.created_time = order.created_time;

                var country = order.country;
                item.country = country;
                item.balance = {};
                balance[country] = item.balance[country] = balance[country] -
                    parseInt(item.count);
              });
            });
          }
        },
        templateUrl : 'js/inventory_history/inventory_history.html?tag=201707032246'
      };
    });
});
