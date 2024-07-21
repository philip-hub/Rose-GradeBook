
# STEP 1 - Node.js version
Run brew list, uninstall any node and or any specific node versions with brew uninstall --force node

Delete any node-related stuff from path if it's still there (check it's deleted by rerunning brew list)

Run brew install nvm

If you don't already have a ~/.zshrc file, create one

Add this line to it: source ~/.nvm/nvm.sh

Run nvm use 22 (run nvm install 22 if v22 is not yet installed)

# STEP 2 - Running backend (Server)

Try running npm run start in Rose-GradeBook/Server/ (npm install dependencies as needed)

# STEP 3 - Running frontend (Client)

Try running npm run dev in Rose-GradeBook/Client/rose-gradebook/ (npm install dependencies as needed)