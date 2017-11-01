<?php
/// 订书模块
include_once 'config.php';
include_once "connection.php";
include_once "datatype.php";
include_once 'permission.php';
include_once "util.php";

$medoo = get_medoo();

abstract class OrderStatus
{
  /// Only new created orders can be cancelled (deleted) by the buyer.
  const CREATED = 0;
  /// Shipped.
  const SHIPPED = 1;
  /// Shipped and paid, no further actions are needed.
  const COMPLETED = 3;
  
  static function fromString($value) {
    $map = ["CREATED" => 0, "SHIPPED" => 1, "COMPLETED" => 3];
    return $map[$value];
  }
}

/// Checks whether we can close an order (shipped and paided).
function _canClose($order) {
  return $order["status"] == OrderStatus::COMPLETED;
}

function get_order($id) {
  global $medoo;
  
  $orders = $medoo->select("orders", "*", ["id" => $id]);
  if (empty($orders)) return null;
  
  $order = current($orders);
  $order["items"] = $medoo->select("order_details", "*", ["order_id" => $id]);
  
  return $order;
}

function get_orders($user_id, $filters, $withItems) {
  global $medoo;
  
  $sql = "SELECT * FROM orders WHERE 1";
  if ($user_id) {
    $sql = $sql. sprintf(" AND user_id=%d", $user_id);
  } elseif (!empty($filters["agent_id"])) {
    $sql = $sql. sprintf(" AND agent_id=%d", $filters["agent_id"]);
  }

  if (!empty($filters["year"])) {
    $sql = $sql. sprintf(" AND YEAR(created_time)=%d", $filters["year"]);
  }
  if (isset($filters["status"]) && $filters["status"] != "") {
    $sql = $sql. sprintf(" AND status=%d", $filters["status"]);
  }

  $orders = $medoo->query($sql. ";")->fetchAll();
  if (!$withItems) return $orders;

  foreach ($orders as $index => $order) {
    $order["items"] = $medoo->select("order_details", "*", 
        ["order_id" => $order["id"]]);
    $orders[$index] = $order;
  }
  return $orders;
}

function get_inventory($agent_id) {
  global $medoo;
  
  return $medoo->select("inventory", "*", ["agent_id" => $agent_id]);
}

function update_inventory($agent_id, $itemDetail, $countryCode,
    $negative = false) {
  global $medoo;
  
  $item_id = $itemDetail["item_id"];
  $delta = intval($itemDetail["count"]);
  if ($negative) {
    $delta = -$delta;
  }

  $data = ["agent_id" => intval($agent_id), "item_id" => intval($item_id), 
      "country" => $countryCode];
  $records = $medoo->select("inventory", "*", ["AND" => $data]);

  if (empty($records)) {
    return $medoo->insert("inventory", array_merge($data, ["count" => $delta]));
  } else {
    return $medoo->update("inventory", ["count[+]" => $delta],
        ["AND" => $data]);
  }
}

function place_order($order) {
  global $medoo;

  $items = $order["items"];
  unset($order["items"]);

  $id = $medoo->insert("orders", $order);
  if (!$id || empty($items)) return $id;

  foreach ($items as $item) {
    unset($item["id"]);
    $item["order_id"] = $id;
    if ($medoo->insert("order_details", $item)) {
      update_inventory($order["agent_id"], $item, $order["country"], true);
    }
  }
  return $id;
}

function close_order($id) {
  global $medoo;
  
  $order = get_order($id);
  if (!$order || !_canClose($order)) return false;
  
  $sql = sprintf("INSERT INTO closed_order_details SELECT". 
      "  * from order_details WHERE order_id = %d;", intval($id));
  $medoo->query($sql);
  
  $sql = sprintf("INSERT INTO closed_orders SELECT". 
      "  * from orders WHERE id = %d;", intval($id));
  $medoo->query($sql);
  
  $medoo->delete("order_details", ["order_id" => $id]);
  return $medoo->delete("orders", ["id" => $id]);
}

function delete_order($id) {
  global $medoo;

  $order = get_single_record($medoo, "orders", $id);
  if ($order == null) return 0;

  $items = $medoo->select("order_details", ["item_id", "count"],
      ["order_id" => $id]);
  if (!empty($items)) {
    $medoo->delete("order_details", ["order_id" => $id]);

    $agent_id = $order["agent_id"];
    $country = $order["country"];
    foreach ($items as $item) {
      update_inventory($agent_id, $item, $country);
    }
  }
  return $medoo->delete("orders", ["id" => $id]);
}

function validate_order_post() {
  if (isset($_POST["usps_track_id"])) {
    $_POST["usps_track_id"] = filter_input(INPUT_POST, "usps_track_id",
        FILTER_VALIDATE_REGEXP,
        ["options" => ["regexp" => "/\b[\dA-Z]+\b/"]]);
  }
  if (isset($_POST["paid"])) {
    $_POST["paid"] = filter_input(INPUT_POST, "paid", FILTER_VALIDATE_FLOAT);
  }
  if (isset($_POST["paypal_trans_id"])) {
    $_POST["paypal_trans_id"] = filter_input(INPUT_POST, "paypal_trans_id",
        FILTER_VALIDATE_REGEXP,
        ["options" => ["regexp" => "/\b[\dA-Z]{17}\b/"]]);
  }
}

function update_order($order, $is_manager) {
  global $medoo;

  $data = build_update_data(["paid", "paypal_trans_id", "paid_date"], $order);
  if ($is_manager) {
    $data = array_merge($data, build_update_data(["status", "shipping",
        "int_shipping", "sub_total", "usps_track_id"], $order));
  }
  
  if (!empty($data["paid"]) && empty($data["paid_date"])) {
    $data["#paid_date"] = "CURDATE()";
  }

  return $medoo->update("orders", $data, ["id" => $order["id"]]);
}

function get_shop_items() {
  global $medoo;

  return keyed_by_id($medoo->select("items", "*", $filters));
}

function get_item_categories() {
  global $medoo;

  return keyed_by_id($medoo->select("item_categories", "*"));
}

function update_item($item) {
  global $medoo;

  return insertOrUpdate($medoo, "items", $item);
}

function update_order_item($item) {
  global $medoo;

  if (empty($item["id"])) return 0;

  return $medoo->update("order_details", 
      build_update_data(["price", "count"], $item), 
      ["id" => $item["id"]]);
}

/// Moves selected items from [$fromOrder] to [$toOrder].
///
/// "id", "sub_total", "int_shipping" of both orders are required.
/// id, price, count, int_shipping of each item are required.  
function move_order_items($fromOrder, $toOrder) {
  global $medoo;

  if (!$fromOrder["id"] || !$toOrder["id"]) return 0;
  
  function selected($item) { return $item["selected"]; }
  $items = array_filter($fromOrder["items"], "selected");
  if (empty($items)) return 0;
  
  $updated = 0;
  function get_id($item) { return $item["id"]; }
  $updated = $medoo->update("order_details", ["order_id" => $toOrder["id"]],
      ["id" => array_map("get_id", $items)]);
  if (!$updated) return 0;
  
  function get_total($total, $item) { 
    $total += intval($item["count"]) * floatval($item["price"]);
    return $total;
  }
  function get_int_shipping($shipping, $item) { 
    $shipping += intval($item["count"]) * floatval($item["int_shipping"]);
    return $shipping;
  }
  $sub_total = array_reduce($items, "get_total", 0.0);
  $int_shipping = array_reduce($items, "get_int_shipping", 0.0);
  
  $fromOrder["sub_total"] = floatval($fromOrder["sub_total"]) - $sub_total;
  $fromOrder["int_shipping"] = 
      floatval($fromOrder["int_shipping"]) - $int_shipping;
  $toOrder["sub_total"] = floatval($toOrder["sub_total"]) + $sub_total;
  $toOrder["int_shipping"] =
      floatval($toOrder["int_shipping"]) + $int_shipping;
  
  $grand = $sub_total + $int_shipping;
  if (floatval($fromOrder["paid"]) >= $grand) {
    $fromOrder["paid"] = floatval($fromOrder["paid"]) - $grand;
    $toOrder["paid"] = floatval($toOrder["paid"]) + $grand;
    $toOrder["paid_date"] = $fromOrder["paid_date"];
  }

  $updated += update_order($fromOrder, TRUE);
  $updated += update_order($toOrder, TRUE);
  return $updated;
}

function delete_order_item($id) {
  global $medoo;
  
  $item = get_single_record($medoo, "order_details", $id);
  if (!$item) return 0;
  
  if ($medoo->delete("order_details", ["id" => $id])) {
    $order = get_single_record($medoo, "orders", $item["order_id"]);
    update_inventory($order["agent_id"], $item, $order["country"]);
  }

  return 1;
}

$response = null;

if (empty($_SESSION["user"])) {
  echo '{"error": "login needed"}';
  exit();
} else {
  $user = unserialize($_SESSION["user"]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET" && isset ( $_GET ["rid"] )) {
  $resource_id = $_GET["rid"];
  if ($resource_id == "orders") {
    if (isset($_GET["order_id"])) {
      $order = get_order($_GET["order_id"]);
      if (!$order) {
        $response = "{}";
      } elseif (canReadOrder($user, $order)) {
        $response = $order;
      } else {
        $response = permision_denied_error();
      }
    } else {
      if (isAgent($user)) {
        $response = get_orders(null, 
            array_merge(["agent_id" => $user->id], $_GET), $_GET["items"]); 
      } else {
        $response = get_orders($user->id, $_GET, $_GET["items"]);
      }
    }
  } elseif ($resource_id == "items") {
    $response = get_shop_items();
  } elseif ($resource_id == "item_categories") {
    $response = get_item_categories();
  } elseif ($resource_id == "inventory") {
    $response = get_inventory($user->id);
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST" && isset ( $_POST ["rid"] )) {
  $resource_id = $_POST["rid"];
  unset($_POST["rid"]);
  
  if ($resource_id == "orders") {
    $order = $_POST;
    validate_order_post();
    if ($order["user_id"] != $user->id && !isAgent($user)) {
      $response = permision_denied_error();
    } elseif (empty($order["id"])) {
      $order["agent_id"] = $user->id;
      $response = ["updated" => place_order($order)];
    } else {
      $existing = get_single_record($medoo, "orders", $order["id"]);
      $response = canWriteOrder($user, $existing) 
          ? ["updated" => update_order($order, isAgent($user))]
          : permision_denied_error();
    }
  } elseif ($resource_id == "move_items") {
    $from = $_POST["from_order"];
    $to = $_POST["to_order"];
    $response = canWriteOrder($user, $to)
      ? ["updated" => move_order_items($from, $to)]
      : permision_denied_error();
  } elseif ($resource_id == "order_details") {
    $response = isAgent($user)
      ? ["updated" => update_order_item($_POST)]
      : permision_denied_error();
  } elseif ($resource_id == "items") {
    $response = isSysAdmin($user)
        ? ["updated" => update_item($_POST)]
        : permision_denied_error();
  } elseif ($resource_id == "inventory") {
    $response = 
        ["updated" => update_inventory($user->id, $_POST, $_POST["country"])];
  }
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE" &&
    isset ( $_REQUEST["rid"] )) {

  $resource_id = $_REQUEST["rid"];

  $record = get_single_record($medoo, $resource_id, $_REQUEST["id"]);
  error_log($user->email ." DELETE ". json_encode($record));
  if ($resource_id == "orders") {
    if (!canWriteOrder($user, $record)) {
      $response = permision_denied_error();
    } else {
      if (floatval($record["paid"]) >= 0.01 || 
          !empty($record["paypal_trans_id"]) || 
          !empty($record["usps_track_id"])) {
        $response = ["error" => "order is paid or shipped"];
      } else {
        $response = ["deleted" => delete_order($_REQUEST["id"])];
      }
    }
  } elseif ($resource_id == "order_details") {
    $order = get_single_record($medoo, "orders", $record["order_id"]);
    if (!canWriteOrder($user, $order)) {
      $response = permision_denied_error();
    } else {
      $response = ["deleted" => delete_order_item($_REQUEST["id"])];
    }
  }
}

if (is_array($response) && empty($response)) {
  echo '[]';
  return;
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
        $response["error"] = get_db_error2($medoo);
      }

  echo json_encode($response);
}
?>
