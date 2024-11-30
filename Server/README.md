NOTE: If any error relating to starting a new instance being flagged as a man-in-the-middle attack, see this: https://serverfault.com/questions/321167/add-correct-host-key-in-known-hosts-multiple-ssh-host-keys-per-hostname
  - Specifically use the ssh-keygen command on the IP Address or hostname (try both) you used

# Backend EC2 Setup Commands
- Boot up an Amazon Linux 2023 EC2 instance, publicly accessible via adding the default security group (all TCP allowed in and out) with an Elastic IP address assigned
  - Make sure the IP is associated with the api.rhatemyprofessors.com subdomain in Route53
- (On your local machine!!) Download the following keys from the Google Drive (https://drive.google.com/drive/folders/1NdcstkfMdttkovbjSILXzMnSPisy90Pl?usp=drive_link) in a couple nested places within the Private Keys Etc. folder
  - MyKeyPair.pem
  - The following under the SSH Stuff subfolder
    - api-generated-private-key.txt
    - gd_bundle-g2-g1.crt
    - 843dfacaca1b6456.pem
    - 843dfacaca1b6456.crt
    - connectivity_config.json
    - email_config.json
- (On your local machine!!) Navigate to downloads
- (On your local machine!!) Run the following (change the corresponding key, user, and URL to match the example SSH connection command): 
scp -i "MyKeyPair.pem" api-generated-private-key.txt ec2-user@ec2-35-174-127-177.compute-1.amazonaws.com:~/
scp -i "MyKeyPair.pem" gd_bundle-g2-g1.crt ec2-user@ec2-35-174-127-177.compute-1.amazonaws.com:~/
scp -i "MyKeyPair.pem" 843dfacaca1b6456.pem ec2-user@ec2-35-174-127-177.compute-1.amazonaws.com:~/
scp -i "MyKeyPair.pem" 843dfacaca1b6456.crt ec2-user@ec2-35-174-127-177.compute-1.amazonaws.com:~/
scp -i "MyKeyPair.pem" connectivity_config.json ec2-user@ec2-35-174-127-177.compute-1.amazonaws.com:~/
scp -i "MyKeyPair.pem" email_config.json ec2-user@ec2-35-174-127-177.compute-1.amazonaws.com:~/
- SSH into the EC2 instance
- Install git
- Install nvm
  - Don’t forget to copy the stuff at the end of the install printing into the end of your ~/.bash_profile and run the following: 
  - Then refresh the bash_profile
    -  source ~/.bash_profile
- Install Node.js v22.9.0 with nvm
  - nvm install 22.9.0
- Clone the repo to the root directory
- Go to /home/ec2-user/Rose-GradeBook/Server
  - Run the following:
    - npm install
    - rm .env
      - This is only for local development; deleting allows server cookies
- Install pm2
  - npm install pm2 -g
- Run the following to add DB and email credentials: 
  - cp ~/connectivity_config.json ~/Rose-GradeBook/Server/connectivity_config.json
  - cp ~/email_config.json ~/Rose-GradeBook/Server/email_config.json
- Run the server
  - pm2 start server.js --name backend
- Debugging
  - To test that this is working, try curling some endpoints from the localhost port (probably 8080) that should be running
    - Should return the corresponding HTML
  - To restart/stop the command: 
    - pm2 restart backend
    - pm2 stop backend
  - To list all running pm2 processes: 
    - pm2 ls

- Install nginx
  - sudo yum install nginx
- Make the following directories: /etc/pki/nginx/ and /etc/pki/nginx/private/
  - You gotta sudo
- Run the following to add the SSL certification and key necessary for HTTPS: 
sudo cp ~/843dfacaca1b6456.crt /etc/pki/nginx/server.crt
sudo cp ~/api-generated-private-key.txt /etc/pki/nginx/private/server.key
- Copy in /etc/nginx/nginx.conf from the nginx.conf file in this directory
- Run and enable nginx
  - sudo systemctl start nginx
  - sudo systemctl enable nginx
- Debugging
  - To test that this is working, try curling some endpoints from the now publicly exposed URLs
  - To restart/stop the daemon: 
    - sudo systemctl restart nginx
    - sudo systemctl stop nginx