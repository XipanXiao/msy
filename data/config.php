{ "nothing" : "<?php /* This makes the following content invisible for web access",
  "localhost": {
    "servername": "127.0.0.1",
    "username": "root",
    "password": "2345678901",
    "dbname": "msy"
  },
  "mzy.000webhostapp.com": {
    "servername": "localhost",
    "username": "",
    "password": "",
    "dbname": "",
    "session_path": "/tmp"
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
