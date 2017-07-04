define('invoice_app', [
    'invoice/invoice',
    'services',
    'utils'],
    function() {

  angular.module('AppModule', [
      'InvoiceModule',
      'ServicesModule',
      'UtilsModule'
      ])
      .directive('body', function(rpc, utils) {
        function parseMoney(value) {
          return value && parseFloat(value) || 0.00;
        }
        return {
          link: function(scope) {
            var order_id;
            var params = location.search.substring(1).split('&');
            for (var i = 0;i < params.length; i++) {
              var pair = params[i].split('=');
              if (pair[0] == 'order_id') {
                order_id = pair[1];
                break;
              }
            }
            rpc.get_order(order_id).then(function(response) {
              if (response.data.error == 'login needed') {
                utils.login();
                return;
              }
              var order = response.data;
              rpc.get_items().then(function(response) {
                var items = response.data;

                order.sub_total = parseMoney(order.sub_total);
                order.shipping = parseMoney(order.shipping);
                order.int_shipping = parseMoney(order.int_shipping);
                order.paid = parseMoney(order.paid);

                order.items.forEach(function(item) {
                  item.name = items[item.item_id].name;
                });
                scope.order = order;
              });
            });
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['invoice_app']);
