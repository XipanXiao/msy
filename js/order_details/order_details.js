define('order_details/order_details', [
    'editable_label/editable_label',
    'address_editor/address_editor', 'permission'], function() {
  return angular.module('OrderDetailsModule', [
      'EditableLabelModule',
      'AddressEditorModule', 'PermissionModule'])
    .directive('orderDetails', function(perm) {
      return {
        scope: {
          admin: '@',
          onCancel: '&',
          onMerge: '&',
          onSplitItem: '&',
          onRemoveItem: '&',
          onMoveItem: '&',
          onSplit: '&',
          onUpdate: '&',
          onUpdateItem: '&',
          order: '='
        },
        link: function(scope) {
          scope.statusLabels = {'-1': '进货', 0: '待发货', 1: '已发货', 3: '钱货两清'};
          scope.hasSelection = function() {
            function itemSelected(item) { return item.selected; }
            var items = scope.order.items;
            return items.length > 1 && items.some(itemSelected);
          };
          scope.isItemSplit = function(itemId) {
            function combine(total, item) {
              return total + (item.item_id == itemId ? 1 : 0);
            }
            return 2 <= scope.order.items.reduce(combine, 0);
          };
          /// Given the selected row at [element], finds the containing order
          /// id.
          function findOrderId(element) {
            var isContainerTable = function(element) {
              return element.id && element.className.indexOf('css-table ') >= 0;
            };
            while (element && !isContainerTable(element)) {
              element = element.parentElement;
            }
            return element.id;
          }
          /// Sets the data to be dropped as the order id.
          window.dragItem = function(event) {
            event.dataTransfer.setData("text", findOrderId(event.target));
          };
          /// Drops selected items from the from order to the target order.
          window.dropItem = function(event) {
            event.preventDefault();
            var fromId = parseInt(event.dataTransfer.getData("text"));
            var toId = parseInt(findOrderId(event.target));
            if (fromId == toId) return;

            scope.onMoveItem({'fromId': fromId, 'toId': toId});
            scope.$apply();
          };
          window.allowDrop = function(event) {
            event.preventDefault();
          };
        },
        templateUrl : 'js/order_details/order_details.html?tag=201801032038'
      };
    });
});
