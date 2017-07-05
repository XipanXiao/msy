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
          
          function getCategories() {
            return rpc.get_item_categories().then(function(response) {
              utils.forEach(response.data, function(category) {
                category.selected = true;
              });
              return scope.categories = response.data;
            });
          }
          
          function getItems() {
            return rpc.get_items().then(function(response) {
              scope.items = [];
              utils.forEach(response.data, function(item) {
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
              utils.requestOneByOne([getCategories, getItems]);
            }
          });
        },
        templateUrl : 'js/item_list/item_list.html?tag=201707032246'
      };
    });
});
