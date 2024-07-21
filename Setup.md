
# STEP 1 - Node.js version
Run brew list, uninstall any node and or any specific node versions with brew uninstall --force node

Delete any node-related stuff from path if it's still there

Run brew install nvm

If you don't already have a ~/.zshrc file, create one

Add this line to it: source ~/.nvm/nvm.sh

Run nvm use 22 (run nvm install 22 if v22 is not yet installed)

Try running npm run start in /Server/package.json