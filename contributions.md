What you will need before contribution: 

.Access to the git repository https://github.com/n00231001/WebDevCA1.3.git 

.Node.js 24 and npm, these are required to install dependancies listed in package.json such as react, express and vite. 

.Docker and Docker Compose; these allow us to run the isolated containers without manual installation as well as configuring the SQL database using the projects compose file. 

.A code editor such as VS Code 

Setting up the project 

The first step to contribution to this project is cloning the repository using git using the command git clone https://github.com/n00231001/WebDevCA1.3.git in a code editor terminal such as VScode and entering the repositor using CD. The next step is to run the docker compose in order to begin running the MYSQL in a container inside the terminal run docker compose up –d . 

Next we need to configure the environment variables we need to do this because the backend needs configuration to properly connect to the database and manage its files. In order to configure these files we need to create a .env file in the route directory. Inside the .env file we need to add variables such as  DBPORT to the appropriate port in our example it is port 3306, DB_USER to must be set to app_user for the database username, DB_password set to  app_password to set the database password, DB_NAME set to app_db to set the databases name and  APP_Secret to set the secrets for user authentication. STORAGE_DRIVER should also be set to local or in the S3. 

Install and start the backend 

Inside the termial run the command  

cd backend 

npm ci 

This installs the dependancies inside backend package-lock.json. Next we need to get the backend listening on port 3000, this can be done by running the npm run dev. 

Next we need to install and start the frontend, after running the backend we need to open up a second terminal and run  the command: 

cd frontend 

npm ci 

npm run dev 

Now the front end should be visible through the link http://localhost:5173. 

Rollbacks 

In case newer versions cause irreversible damage  to the main branch of the project we implemented a rollback system which allows us to move back to older versions of the project in case of emergency.  In order to create these rollbacks we needed to create 3 files in the workflow file known as checks.yml, publish.yml and rollback.yml. Checks.yml is designed to check code changes automatically, publish.yml builds the docker images and pushes them to the ECR and deploys the EC2, rollbacks.yml allows a previous version to be restored manually. In our project there are 2 ways for us to rollback, manual and automatic. 

In order for a user to use a manual rollack all they have to do is open up the repository, click the actions tab, select the dropbox rollback workflow and click run window, after choosing a branch the user should be able to select which commit they would like to rollback to by entering the name of the commit. 

In comparison when the automatic rollback runs whenever a new version is deployed, the script checks whether the frontend and backend are both responding correctly, if the deployment fails the health checks, the deployment script attempts to restore the previously working version automatically. In order to verify these rollbacks by logging into the EC2 instance and running the command "sudo docker ps". 

Security guidelines  

In order to keep this application safe we used environmental variables to configure the application with having to hardcode in sensitive information. For example our we used DB_PASSWORD in order to obtain the password for the backend instead of hardcoding in a password which would be easily stolen by reading the code, this also allowed for us to have different enviornments with different credentials. 

 