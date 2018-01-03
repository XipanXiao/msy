define('order_stats/order_stats', [
    'services', 'utils'], function() {
  return angular.module('OrderStatsModule', [
      'ServicesModule', 'UtilsModule'])
    .directive('orderStats', function(rpc, utils) {
      function toMoney(num) {
        return Math.round( parseFloat(num) * 1e2 ) / 1e2;
      }
      return {
        scope: {
          year: '=',
          orders: '='
        },
        link: function(scope) {
          function getMonth(order) {
            var d = new Date(order.created_time);
            return d.getMonth() + 1;
          }
          
          function calculate_order_sub_total(order) {
            order.sub_total = order.items.reduce(
                (sum, item) => sum + item.price * item.count, 0).toFixed(2);
            order.count = order.items.reduce((sum, item) => sum + (+item.count),
                0);
          }

          function getIncomingOrders() {
            var filters = {items: true, status: -1, year: scope.year};
            return rpc.get_orders(null, filters).then(function(response) {
              var orders = response.data || [];
              orders.forEach(calculate_order_sub_total);
              return scope.incoming_orders = orders;
            });
          }

          function calcStats() {
            var orders = scope.orders.concat(scope.incoming_orders);
            var emptyStat = {
                gross: 0.00,
                cost: 0.00,
                itemsIn: 0,
                itemsOut: 0,
            };
            scope.stats = utils.mix_in({}, emptyStat);
            orders.forEach(function(order) {
              var month = getMonth(order);
              var stat = scope.months[month] || utils.mix_in({}, emptyStat);
              scope.months[month] = stat; 
              if (order.sub_total > 0) {
                stat.gross += +order.sub_total;
                stat.itemsOut += order.count;
              } else {
                stat.cost += -order.sub_total;
                stat.itemsIn += -order.count;
              }
            });
            scope.monthKeys = utils.keys(scope.months);
            scope.months.forEach(function(month) {
              scope.stats.gross += +month.gross;
              scope.stats.itemsOut += month.itemsOut;
              scope.stats.cost += +month.cost;
              scope.stats.itemsIn += +month.itemsIn;
            });
            return utils.truePromise();
          };
          
          function reload(orders) {
            scope.months = [];
            if (!orders || !orders.length) return;
            utils.requestOneByOne([getIncomingOrders, calcStats]); 
          }
          scope.$watch('orders', reload);
          reload(scope.orders);
        },
        templateUrl : 'js/order_stats/order_stats.html'
      };
    });
});
