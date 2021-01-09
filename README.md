# Serverless Shopping List App

This is a simple Shopping list app, which can be extended to utilise Alexa voice control to add and remove item.
This app has being created as final capstone project of Udacity Cloud Developer nano degree program utilising learned concepts.

The serverless app starting code from project 4 of Udacity Cloud Developer nano degree program was used as a starting point to create this app.

# Functionality of the application

This application will allow creating/removing/updating/fetching Shopping list items. Optionally user can add image and price of the item. 

Later it is planned to implement autocomplete so if user type the item name, the app check the previously stored items and show the matches so user can select it(in this case all item details will be filled from previous stored item).

# Shopping list items

The application store Shopping list items, and each tem contains the following fields:

* `userId` (string) - User Id of the user who created an item
* `itemId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of an item (e.g. "Milk")
* `done` (boolean) - true if an item was completed, false otherwise
* `price` (number) - optional item price
* `imageUrl` (string) - optional item image url


# How to run the application

## Backend

Before deployment of the application first edit the `backend/src/config.ts` file to set JSON Web Key Set URL (how to get url described in the file)

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters which you will have after setting up Auth0 account and deploying backend. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless Shopping list application.