{ "nothing" : "<?php /* This makes the following content invisible for web access",
  "localhost": {
    "servername": "127.0.0.1",
    "username": "root",
    "password": "2345678901",
    "dbname": "msy"
  },
  "default": {
    "servername": "${MYSQL_SERVICE_HOST}",
    "username": "${MYSQL_USER}",
    "password": "${MYSQL_PASSWORD}",
    "dbname": "msy"
  },
  "mzy-us.appspot.com": {
    "servername": null,
    "socket": "${MYSQL_SOCKET}",
    "username": "${MYSQL_USERNAME}",
    "password": "${MYSQL_PASSWORD}",
    "dbname": "msy"
  },
  "msy-bicw.rhcloud.com": {
    "servername": "${OPENSHIFT_MYSQL_DB_HOST}",
    "username": "${OPENSHIFT_MYSQL_DB_USERNAME}",
    "password": "${OPENSHIFT_MYSQL_DB_PASSWORD}",
    "dbname": "msy",
    "session_path": "${OPENSHIFT_TMP_DIR}"
  },
  "closing": "*/?>"
}
