define('order_app', [
    'app_bar/app_bar',
    'item_list/item_list',
    'shopping_cart/shopping_cart',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'ItemListModule',
      'ShoppingCartModule',
      'ServicesModule',
      'PermissionModule',
      'UtilsModule',
      ])
      .directive('body', function($rootScope, rpc, perm, utils) {
        return {
          link: function(scope) {
            scope.pageLoaded = [];
            
            scope.cart = {
              size: 0,
              subTotal: 0.0,
              shipping: 0.0,
              items: {},
              add: function(item) {
                var existing = this.items[item.id];
                if (existing) {
                  existing.count++;
                } else {
                  item.count = 1;
                  this.items[item.id] = item;
                }
                this.update();
              },
              remove: function(id) {
                delete this.items[id];
                this.update();
              },
              update: function() {
                this.size = 0;
                this.subTotal = 0.0;
                this.int_shipping = 0.0;
                this.shipping = 0.0;
                for (var id in this.items) {
                  var item = this.items[id];
                  this.size += item.count;
                  this.subTotal += item.count * item.price;
                  this.int_shipping += item.count * item.int_shipping;
                  this.shipping += item.count * item.shipping;
                }
                this.subTotal = this.subTotal.toFixed(2);
                this.int_shipping = this.int_shipping.toFixed(2);
                this.shipping = (this.shipping || 0).toFixed(2);
              },
              clear: function() {
                this.items = {};
                this.update();
              },
              checkOut: function(user) {
                var order = {
                  user_id: user.id,
                  sub_total: this.subTotal,
                  int_shipping: this.int_shipping,
                  shipping: this.shipping,
                  name: user.name,
                  phone: user.phone,
                  email: user.email,
                  street: user.street,
                  city: user.city,
                  state: user.state,
                  country: user.country,
                  zip: user.zip,
                  items: []
                };
                for (var id in this.items) {
                  var item = this.items[id];
                  order.items.push({
                    item_id: item.id,
                    price: item.price,
                    count: item.count
                  });
                }
                var cart = this;

                var saveUserInfo = function() {
                  return rpc.update_user(user).then(function(response) {
                    var user = response.data.updated;
                    if (!user.id) return false;
                    order.user_id = user.id;
                    return true;
                  });
                };
                
                var placeOrder = function() {
                  return rpc.update_order(order).then(function(response) {
                    if (parseInt(response.data.updated)) {
                      cart.clear();
                      $rootScope.$broadcast('reload-orders');
                      document.querySelector('#toast0').open();
                      return true;
                    }
                    return false;
                  });
                };
                
                utils.requestOneByOne([saveUserInfo, placeOrder]);
              }
            };

            rpc.get_user().then(function(user) {
              perm.user = user;
              scope.user = user;
            });

            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
       
            tabs.addEventListener('iron-select', function() { 
              scope.pageLoaded[pages.selected = tabs.selected] = true;
              setTimeout(function() {
                scope.$apply();
              }, 0);
            });
            
            scope.selectTab = function(index) {
              tabs.selected = index;
            };
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['order_app']);
