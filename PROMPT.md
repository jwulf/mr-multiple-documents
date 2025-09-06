OK Copilot, we are building a minimal reproducer to isolate an issue with uploading multiple documents to a Camunda 8 server. We want to keep this as simple and as focused as possible to allow us to isolate the issue we are interested in. There is no need for performance optimisation, features, or any backward compatibility in this project.

Scaffold an npm project in this directory. We are using TypeScript.

Add express and a single controller method that accepts a POST of a multi-part form containing an array of files. 
The express server needs to serve a static html page with a file picker that allows the user to choose one or more files to upload, and a Submit button that POSTs them to the express controller.
Add @camunda8/sdk to the project. 
In the express implementation, create a new Camunda8().getCamundaRestClient(). No configuration is needed in the constructor, we are using the zero-conf constructor that configures via env vars.
In the controller, we want to call the CamundaRestClient.uploadDocuments() method, and post the received files. 