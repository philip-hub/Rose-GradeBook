- Frontend-Backend Connection
  - Will just separately host them and make calls to the backend
  - Enable only requests from the frontend domain to the backend domain via HTTP headers or NACL or sumn
- SQL Server to MySQL
  - SPROCS to functions
    - So SQL Server has sprocs with output params and return values; you have to choose between them for MySQL/MariaDB
      - Any nonnegative return value will be success now; any negative failure
    - There are no table valued variables in MySQL
      - Prepare the statement and then insert into temporary table
      - Or use the load file: https://mariadb.com/kb/en/load-data-infile/
        - Ye prolly that one into a temp table, then do an insert into select
        - Gotta make sure to enable local file loading in the connection, see image
  - Database Connectivity (choose whichever one minimizes refactoring)
    - https://www.npmjs.com/package/mariadb
    - Or Knex: 
      - https://knexjs.org/
    - It looks like MariaDB is for the best; has a similar enough promise API that I can hopefully translate more or less
  - Test changes in DBFiddle
    - https://dbfiddle.uk/yPPKkZV-
  - Use DMS after the import; MySQL for further connectivity
    - AWS Database Migration Service helps you migrate databases to AWS quickly and securely. The source database remains fully operational during the migration, minimizing downtime to applications that rely on the database. The AWS Database Migration Service can migrate your data to and from most widely used commercial and open-source databases.
AWS Database Migration Service can migrate your data to and from most of the widely used commercial and open source databases. It supports homogeneous migrations such as Oracle to Oracle, as well as heterogeneous migrations between different database platforms, such as Oracle to Amazon Aurora. Migrations can be from on-premises databases to Amazon RDS or Amazon EC2, databases running on EC2 to RDS, or vice versa, as well as from one RDS database to another RDS database. It can also move data between SQL, NoSQL, and text based targets.
In heterogeneous database migrations the source and target databases engines are different, like in the case of Oracle to Amazon Aurora, Oracle to PostgreSQL, or Microsoft SQL Server to MySQL migrations. In this case, the schema structure, data types, and database code of source and target databases can be quite different, requiring a schema and code transformation before the data migration starts. That makes heterogeneous migrations a two step process. First use the AWS Schema Conversion Tool to convert the source schema and application code to match that of the target database, and then use the AWS Database Migration Service to migrate data from the source database to the target database. All the required data type conversions will automatically be done by the AWS Database Migration Service during the migration. The source database can be located in your own premises outside of AWS, running on an Amazon EC2 instance, or it can be an Amazon RDS database. The target can be a database in Amazon EC2 or Amazon RDS.
- Reduce Cloud Costs for DB
  - Right now it's $80/month w no users
  - Try MySQL RDS, if that's no good we can try EC2 or just buying a cheap DB Server for like $200
    - Getting high availability out of a home server is out of the scope of this project, refactoring is currently the main option
- Make AMI
      - TODO: Follow from [ASSOCIATESHARED][DEMO] Splitting Wordpress Monolith => APP & DB when setting up web server separate from DB
        - However, just use RDS for the MySQL DB once in prod. The backups will make it much easier
      - Based on the descriptions, it seems like AMI would be good for both DB and any horizontal scaling
  - Use EFS for the file system with EC2 used to run this, will make horizontal scaling chill cause they can all use same files whilee not at risk of losing thdm if there's a crash
    -  see demo lesson also efs vs s3 vs ebs: https://aws.amazon.com/efs/when-to-choose-efs/
- SSH
  - https://stackoverflow.com/questions/25869207/getting-warning-unprotected-private-key-file-error-message-while-attempting
- Download MariaDB and connect from mac with TablePlus
  - Make sure to use elastic ip for
  - cd to Documents for the .pem that gets autosuggested
  - Found one that fuckin worked, this guy goated: https://www.youtube.com/watch?v=R32-B731Jbg
    - Lessons learned: allow all traffic in security group, be very careful with what users you create in mysql, they need % for remote access
      - https://medium.com/@mehmetodabashi/how-to-install-mariadb-on-an-ec2-instance-cbe688038542
        - Supplementary, for systemctl enable
    - Used this to fill in any missing commands, and sudo for oner of the last ones
      - https://docs.aws.amazon.com/linux/al2023/ug/ec2-lamp-amazon-linux-2023.html#prepare-lamp-server-2023
- Finish Front End
  - Shouldn't be too bad
