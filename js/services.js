define('services', [], function() {
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number]
            : match;
      });
    };
  }

  var serviceUrl = 'cgi-bin/services.php';
  var departmentsPromise;
  
  function http_form_post($http, data, url) {
    return $http({
        method: 'POST',
        url: url || serviceUrl,
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  }

  return angular.module('ServicesModule', []).factory('rpc', function($http, 
      $httpParamSerializerJQLike) {
    return {
      get_users: function(email, agentId) {
        return $http.get('{0}?rid=users&email={1}&agent_id={2}'.
            format(serviceUrl, email || '', agentId || ''));
      },
      
      getUserById: function(id) {
        return $http.get('{0}?rid=users&id={1}'.format(serviceUrl, id));
      },
      
      list_user_names: function(prefix) {
        return $http.get('{0}?rid=user_names&prefix={1}'
            .format(serviceUrl, prefix || ''));
      },
      
      get_user: function(email) {
        return this.get_users(email).then(function(response) {
          if (response.data.error == "login needed") {
            var index = location.pathname.lastIndexOf("/") + 1;
            var filename = location.pathname.substr(index);
            location.href = 'login.html?redirect=' + filename;
          } else {
            return response.data;
          }
        });
      },
      
      get_admins: function(permission) {
        var url = "{0}?rid=admins&permission={1}".format(serviceUrl,
            permission);
        return $http.get(url);
      },

      get_order: function(order_id) {
        var url = "cgi-bin/shop.php?rid=orders&order_id={0}".format(order_id);
        return $http.get(url);
      },
      
      get_orders: function(student_id, filters) {
        var url = "cgi-bin/shop.php?rid=orders&status={0}&items={1}&year={2}" 
            .format(filters.status || '', filters.items || '', 
            filters.year || '');
        return $http.get(url);
      },
      
      get_items: function(category, level) {
        var url = 'cgi-bin/shop.php?rid=items&category={0}&level={1}'
            .format(category || '', parseInt(level) || (level === 0 ? 0 : ''));
        return $http.get(url);
      },
      
      get_item_categories: function(level) {
        var url = 'cgi-bin/shop.php?rid=item_categories&level={0}'
            .format(parseInt(level) || (level === 0 ? 0 : ''));
        return $http.get(url);
      },
      
      get_order_stats: function(year) {
        var url = 'cgi-bin/shop.php?rid=order_stats&year={0}'.format(year);
        return $http.get(url);
      },
      
      get_inventory: function() {
        return $http.get('cgi-bin/shop.php?rid=inventory');
      },
      
      update_user: function(user) {
        user.rid = 'user';
        return http_form_post($http, $httpParamSerializerJQLike(user));
      },
      
      search: function(prefix) {
        return $http.get(serviceUrl + '?rid=search&prefix=' + prefix);
      },
      
      update_order: function(order) {
        order.rid = 'orders';
        return http_form_post($http, $httpParamSerializerJQLike(order),
            'cgi-bin/shop.php');
      },
      
      update_order_item: function(item) {
        item.rid = 'order_details';
        return http_form_post($http, $httpParamSerializerJQLike(item),
            'cgi-bin/shop.php');
      },
      
      merge_orders: function(order_ids) {
        var request = {
            rid: 'merge_orders',
            order_ids: order_ids
        };
        return http_form_post($http, $httpParamSerializerJQLike(request),
            'cgi-bin/shop.php');
      },
      
      move_order_items: function(fromOrder, toOrder) {
        var request = {
            rid: 'move_items',
            from_order: fromOrder,
            to_order: toOrder
        };
        return http_form_post($http, $httpParamSerializerJQLike(request),
            'cgi-bin/shop.php');
      },
      
      update_item: function(item) {
        item.rid = 'items';
        return http_form_post($http, $httpParamSerializerJQLike(item),
            'cgi-bin/shop.php');
      },

      split_item: function(item_id) {
        var data = {rid: 'split_item', item_id: item_id};
        return http_form_post($http, $httpParamSerializerJQLike(data),
            'cgi-bin/shop.php');
      },
      
      update_inventory: function(item_id, country, delta) {
        var data = {
          rid: 'inventory', 
          item_id: item_id, 
          country: country, 
          count: delta
        };
        return http_form_post($http, $httpParamSerializerJQLike(data),
            'cgi-bin/shop.php');
      },
      
      remove_user: function(user_id) {
        var url = '{0}?rid=user&id={1}'.format(serviceUrl, user_id);
        return $http.delete(url);
      },

      remove_order: function(order_id) {
        var url = '{0}?rid=orders&id={1}'.format('cgi-bin/shop.php', order_id);
        return $http.delete(url);
      },

      remove_order_item: function(id) {
        var url = '{0}?rid=order_details&id={1}'.format('cgi-bin/shop.php', id);
        return $http.delete(url);
      },
      
      /// Given a [zip] code, returns the address.
      lookup: function(zip, countryCode) {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?' + 
            'address={0}&sensor=false&language=zh'.format(zip);
        if (countryCode) {
          url += '&components=country:{0}'.format(countryCode);
        }
        return $http.get(url).then(function(response) {
          return response.data.status == 'OK' && response.data.results;
        });
      }
    };
  });
});
