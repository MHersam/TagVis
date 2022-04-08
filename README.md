# TagVis

TagVis is an interactive visualization tool for analyzing relations between academic papers. Connections between papers are established through assigned tags or citation data. Tagging papers is facilitated by tag suggestions and users can collectively build (tagged) collections of papers, or discover further literature on their own. Visualized graphs can be saved and shared as interactive sessions.

## Build for Production and Run
### Prerequisite:
Node.js needs to be installed, you can download it here: https://nodejs.org/en/download/
It needs to be a recent version, can't tell right now how recent. If there are any problems while installing, either try the latest LTS or the current version of Node.js.<br>
It is recommended to deploy the server with Node.js clustering enabled. You can use PM2 for that. Install PM2 globally: <code>npm install pm2 -g</code><br>
A MongoDB server needs to be available. MongoDB can be downloaded from https://www.mongodb.com/try/download/community

### Required Steps
1. Open <b>config.json</b> and fill all fields with your data
	1. Create a Mendeley application here: https://dev.mendeley.com/myapps.html and enter you app id, secret and redirect url
	2. Create a Zotero application here: https://www.zotero.org/oauth/apps/new with 'Browser' as 'Application Type'. Enter your client id, secret and redirect url.
	3. The tool requires a SemanticScholar API key. SemanticScholar API keys can be requested at https://pages.semanticscholar.org/data-partners
	4. Optionally you can change the semanticscholar.refreshinterval if you want, Semantic Scholar documents in the database are refreshed on-demand if the entry is older than the given time in milliseconds. The default is 14 days.
	5. Change the MongoDB URL, if yours differs from the default
	6. Change the tagvis secret to a random string. It needs to stay secret!
2. Change directory to ~/tagvis/webapp/tag-vis/ with <code>cd webapp/tag-vis</code>
3. Install dependencies for the vue app <code>npm install</code>
4. Create the production build <code>npm run build</code> (if errors occur, check if a directory 'dist' was created, try proceeding with step 5 if it exists)
5. Change directory to ~/tagvis/server/ <code>cd ../../server</code>
6. Install dependencies for the express server <code>npm install</code>
7. Run the server <code>pm2 start app.js -i max</code> or alternatively <code>node app.js</code>
8. Follow the instruction in ~/tagvis/specter/README.md to install the document embedding server. If you run this server on a different machine, you will have to change the specter.serverurl in ~/tagvis/config.json accordingly.

If everything worked, the system should now be available under http://localhost:3000

## Run Development Server
Run system with hot reloading for both the Express server and the Vue app.
### Prerequisite:
Node.js needs to be installed, you can download it here: https://nodejs.org/en/download/
It needs to be a recent version, can't tell right now how recent. If there are any problems while installing, either try the latest LTS or the current version of Node.js.
Nodemon should be installed globally for hot reloading node server <code>npm install -g nodemon</code><br>
A MongoDB server needs to be available. MongoDB can be downloaded from https://www.mongodb.com/try/download/community

### Required Steps
1. Open <b>config.json</b> and fill all fields with your data
	1. Create a Mendeley application here: https://dev.mendeley.com/myapps.html and enter you app id, secret and redirect url
	2. Create a Zotero application here: https://www.zotero.org/oauth/apps/new with 'Browser' as 'Application Type'. Enter your client id, secret and redirect url.
	3. The tool requires a SemanticScholar API key. SemanticScholar API keys can be requested at https://pages.semanticscholar.org/data-partners
	4. Optionally you can change the semanticscholar.refreshinterval if you want, Semantic Scholar documents in the database are refreshed on-demand if the entry is older than the given time in milliseconds. The default is 14 days.
	5. Change the MongoDB URL, if yours differs from the default
	6. Change the tagvis secret to a random string. It needs to stay secret!
2. Change directory to ~/tagvis/webapp/tag-vis/ with <code>cd webapp/tag-vis</code>
3. Install dependencies for the vue app <code>npm install</code>
4. Start the development server <code>npm start</code>
5. Open another command line window and navigate to ~/tagvis/server/ <code>cd server</code>
6. Install dependencies for the express server <code>npm install</code>
7. Run the server <code>nodemon app.js</code> or <code>node app.js</code>
8. Follow the instruction in ~/tagvis/specter/README.md to install the document embedding server. If you run this server on a different machine, you will have to change the specter.serverurl in ~/tagvis/config.json accordingly.

If everything worked, the system should now be available under http://localhost:8080
