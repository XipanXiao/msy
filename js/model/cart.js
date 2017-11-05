define('model/cart', [], function() {
  var utils, rpc, rootScope;

  var cart = {
    size: 0,
    subTotal: 0.0,
    shipping: 0.0,
    items: {},
    userLevel: 0,
    isEmpty: true,
    add: function(item) {
      var existing = this.items[item.id];
      if (existing) {
        existing.count += (item.count || 1);
      } else {
        item = utils.mix_in({}, item);
        item.count = (item.count || 1);
        this._updatePrice(item);
        this.items[item.id] = item;
      }
      this.update();
    },
    remove: function(id) {
      delete this.items[id];
      this.update();
    },
    _updatePrice: function(item) {
      item.price = item['cost' + this.userLevel];
    },
    // Change prices of the items in the cart, based on user privilege.
    changePrice: function(level) {
      this.userLevel = level;
      for (var id in this.items) {
        this._updatePrice(this.items[id]);
      }
      this.update();
    },
    update: function() {
      this.size = 0;
      this.subTotal = 0.0;
      this.int_shipping = 0.0;
      this.shipping = 0.0;
      this.isEmpty = true;
      for (var id in this.items) {
        var item = this.items[id];
        this.size += item.count;
        this.subTotal += item.count * item.price;
        this.int_shipping += item.count * item.int_shipping;
        this.shipping += item.count * item.shipping;
        this.isEmpty = false;
      }
      this.subTotal = this.subTotal.toFixed(2);
      this.int_shipping = this.int_shipping.toFixed(2);
      this.shipping = (this.shipping || 0).toFixed(2);
    },
    clear: function() {
      this.items = {};
      this.update();
    },
    checkOut: function(user, refill) {
      var order = {
        user_id: user.id,
        status: refill ? -1 : 0,
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
          cost: refill ? 0 : item.cost,
          count: refill ? (-item.count) : item.count
        });
      }
      var cart = this;

      var saveUserInfo = function() {
        if (refill) return utils.truePromise();

        if (user.isNew) {
          delete user.isNew;
          delete user.id;
        }
        delete user.password;
        return rpc.update_user(user).then(function(response) {
          var created = response.data.updated;
          if (!created) return order.user_id;
          return order.user_id = created.id;
        });
      };
      
      var placeOrder = function() {
        return rpc.update_order(order).then(function(response) {
          if (parseInt(response.data.updated)) {
            cart.clear();
            rootScope && rootScope.$broadcast('reload-orders');
            var toast = document.querySelector('#toast0');
            toast && toast.open();
            return true;
          }
          return false;
        });
      };
      
      return utils.requestOneByOne([saveUserInfo, placeOrder]);
    }
  };
  return function(params) {
    utils = params.utils;
    rpc = params.rpc;
    rootScope = params.rootScope;

    utils.mix_in(this, cart);
  };
});
