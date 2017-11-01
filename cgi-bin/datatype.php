<?php
class User {
  public static $int_fields = ["sex", "permission", "state", "level"];
  public function __construct($row) {
    foreach ($row as $key => $value) {
      $this->$key = in_array($key, User::$int_fields) ? intval($value) : $value;
    }
  }
}
?>
