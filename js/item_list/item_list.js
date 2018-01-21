define('item_list/item_list', ['flying/flying', 'services', 'utils'], function() {
  return angular.module('ItemListModule', ['FlyingModule', 'ServicesModule',
        'UtilsModule'])
    .directive('itemList', function(rpc, utils) {
      return {
        scope: {
          cart: '=',
          user: '='
        },
        link: function(scope) {
          scope.items = [];
          scope.quantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50];
          scope.selectedCategory = {};
          
          function getCategories() {
            return rpc.get_item_categories().then(function(response) {
              for (var id in response.data) {
                scope.selectedCategory.id = id;
                break;
              }
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
          
          scope.addToCart = function(item) {
            scope.cart.add(item);
          };
          
          scope.$watch('user', function(user) {
            if (user) {
              scope.showCost = parseInt(user.level);
              utils.requestOneByOne([getCategories, getItems]);
            }
          });
        },
        templateUrl : 'js/item_list/item_list.html?tag=201801212246'
      };
    });
});
