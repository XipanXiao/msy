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
              scope.items = response.data;

              var balance = {"CN": 0, "US": 0};
              scope.items.forEach(function(item) {
                var country = item.country;
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
