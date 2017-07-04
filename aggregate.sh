echo "Aggregating JavaScript files"
rm -f order.js
for f in `cat order.deps`; do cat $f >> order.js; done;
rm -f order_admin.js
for f in `cat order_admin.deps`; do cat $f >> order_admin.js; done;
rm -f invoice_print.js
for f in `cat invoice_print.deps`; do cat $f >> invoice_print.js; done;

echo "RewriteEngine on" > .htaccess
echo "RewriteCond %{HTTP:X-Forwarded-Proto} !https" >> .htaccess
echo "RewriteRule .* https://%{HTTP_HOST}%{REQUEST_URI} [R,L]" >> .htaccess
