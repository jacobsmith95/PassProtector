# How to deploy the project to Google Cloud Run

## Setup applications on your local machine

### Install these applications:
* Node.js: version 20.12.1
* NPM: version 10.5.0
* Docker Desktop: https://www.docker.com/products/docker-desktop/
* Google Cloud SDK shell: https://cloud.google.com/sdk/docs/install
  * When installed, run this from gcloud CLI: gcloud auth login

## Create a Google Cloud run project

<ol>
<li> Login to Google.</li>
<li> Open the console: https://console.cloud.google.com/</li>
<li> Select a Project >> New Project (drop down menu near top left with list of projects).</li>
<li> Input a project name.</li>
<li> Click Create</li>
<li> Store the project-id that was created for this project.</li>
<li> Enable billing in Google Cloud.</li>
<li> Open gcloud CLI and set the project name: gcloud config set project project-id</li>
</ol>

Note: we initialize the Cloud Run service when we deploy the application from the gcloud CLI  (see below)

## Deploy a Google Cloud run project

Items that need to be changed when switching between local and cloud:
* Backend: origins in main.py
* Frontend: Access-Control-Allow-Origin in config.js

### Deploy the Frontend

Open the CLI in the location where the React public and src folders are, then run these commands:
* npm run build
* gcloud run deploy
* Source code location: frontend
* Service name: frontend
* Region: I used [35] us-east5, but you can use any as long as it’s the same as the backend.  

### Deploy the backend

These files are needed to deploy the backend
*	app.yaml
*	Dockerfile (If you add a file, add a new line to copy the file to /code/)

Open the CLI in the location where main.py is, then run these commands:
*	gcloud run deploy
*	Source code location: backend
*	Service name: backend
*	Region: I used [35] us-east5, but you can use any as long as it’s the same as the frontend.  
