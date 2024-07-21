
# DBUser=mariadb user
# DBPassword=password for the mariadb user
# DBRootPassword = root password for mariadb

# STEP 1 - Configure Authentication Variables which are used below
DBUser='gaurav'
DBPassword='mavsinfive'
DBRootPassword='mavsinfive'

# STEP 2 change password and shit to DBRootPassword, default choices fine allegedly

sudo dnf install mariadb105-server

sudo systemctl start mariadb
sudo systemctl status mariadb
sudo systemctl enable mariadb

# enter same password as dbrootpassword ig, say no to things you dont understand yes to what sounds good
sudo mysql_secure_installation

# STEP 3 - Log in
sudo mysql -u root -p --password=$DBRootPassword

# STEP 7 Set up remote user - fill in the constants (leave single quotes I think) don't actually use these commands

CREATE USER '$DBUser'@'%' IDENTIFIED BY '$DBPassword';

# the % is super important, allows from all locations the user to connect from

GRANT ALL PRIVILEGES ON *.* TO '$DBUser'@'%' WITH GRANT OPTION;

# changes mean we restart = flush privs

FLUSH PRIVILEGES;

# Step 9 - Funtivities

sudo dnf install -y cowsay

cowsay "oh hi"

# Step 10 to ensure it's listening on 3306

 netstat -tlnp

===== On the client side =====

# Step 11 check that connection is in order

brew services start mariadb

mariadb -h [insert elastic ip] -u [$DBUser] -p [$DBPassword]

# Step 12 connect using rdbms

On mac, use tableplus (see image for example config)

On windows, use heidisql or maybe also tableplus