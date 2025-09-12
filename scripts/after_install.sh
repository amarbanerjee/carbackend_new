#!/bin/bash
echo 'run after_install.sh: ' >> /home/ec2-user/carbackend_new/deploy.log

echo 'cd /home/ec2-user/carbackend_new' >> /home/ec2-user/carbackend_new/deploy.log
cd /home/ec2-user/carbackend_new >> /home/ec2-user/carbackend_new/deploy.log

echo 'npm install' >> /home/ec2-user/carbackend_new/deploy.log 
npm install >> /home/ec2-user/carbackend_new/deploy.log
