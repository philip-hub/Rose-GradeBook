NOTE: If any error relating to starting a new instance being flagged as a man-in-the-middle attack, see this: https://serverfault.com/questions/321167/add-correct-host-key-in-known-hosts-multiple-ssh-host-keys-per-hostname
  - Specifically use the ssh-keygen command on the IP Address or hostname (try both) you used

# Frontend Setup Commands
- Boot up an Amazon Linux 2023 (amazon/al2023-ami-2023.6.20241121.0-kernel-6.1-x86_64) EC2 instance, publicly accessible via adding the default security group (all TCP allowed in and out) with an Elastic IP address assigned
  - Make sure the IP is associated with the rhatemyprofessors.com domain in Route53
- (On your local machine!!) Download the following keys from the Google Drive (https://drive.google.com/drive/folders/1NdcstkfMdttkovbjSILXzMnSPisy90Pl?usp=drive_link) in a couple nested places within the Private Keys Etc. folder
  - OpenGradebook1.pem
  - The following under the SSH Stuff subfolder
    - generated-private-key.txt
    - gd_bundle-g2-g1.crt
    - 934657c5454f0e53.pem
    - 934657c5454f0e53.crt
- (On your local machine!!) Navigate to downloads
- (On your local machine!!) Run the following (change the corresponding key, user, and URL to match the example SSH connection command): 
scp -i "OpenGradebook1.pem" generated-private-key.txt ec2-user@ec2-3-83-151-198.compute-1.amazonaws.com:~/
scp -i "OpenGradebook1.pem" gd_bundle-g2-g1.crt ec2-user@ec2-3-83-151-198.compute-1.amazonaws.com:~/
scp -i "OpenGradebook1.pem" 934657c5454f0e53.pem ec2-user@ec2-3-83-151-198.compute-1.amazonaws.com:~/
scp -i "OpenGradebook1.pem" 934657c5454f0e53.crt ec2-user@ec2-3-83-151-198.compute-1.amazonaws.com:~/
- SSH into the EC2 instance
- Install git
- Install nvm
  - Don’t forget to copy the stuff at the end of the install printing into the end of your ~/.bash_profile and run the following: 
  - Then refresh the bash_profile
    -  source ~/.bash_profile
- Install Node.js v22.9.0 with nvm
  - nvm install 22.9.0
- Clone the repo to the root directory
- Go to /home/ec2-user/Rose-GradeBook/Client/rose-gradebook
  - Run the following: 
    - npm install
    - rm .env
      - This is only for local development; deleting allows server cookies
- Install pm2
  - npm install pm2 -g
- Run the server
  - pm2 start "npm run dev" --name frontend
- Debugging
  - To test that this is working, try curling some endpoints from the localhost port (probably 3000) that should be running
    - Should return the corresponding HTML
  - To restart/stop the command: 
    - pm2 restart frontend
    - pm2 stop frontend
  - To list all running pm2 processes: 
    - pm2 ls

- Install nginx
  - sudo yum install nginx
- Make the following directories: /etc/pki/nginx/ and /etc/pki/nginx/private/
  - You gotta sudo
- Run the following to add the SSL certification and key necessary for HTTPS: 
sudo cp ~/934657c5454f0e53.crt /etc/pki/nginx/server.crt
sudo cp ~/generated-private-key.txt /etc/pki/nginx/private/server.key
- Copy in /etc/nginx/nginx.conf from the nginx.conf file in this directory
- Run and enable nginx
  - sudo systemctl start nginx
  - sudo systemctl enable nginx
- Debugging
  - To test that this is working, try curling some endpoints from the now publicly exposed URLs
  - To restart/stop the daemon: 
    - sudo systemctl restart nginx
    - sudo systemctl stop nginx