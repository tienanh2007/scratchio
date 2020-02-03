# Normal Set Up

1. Install node
2. Install psql (user: docker, password: docker, database: scratch, port: 5432, host: localhost)
3. Create the table ``` npm run migrate ```
4. Run the server ``` npm start ```
5. Run the test ``` npm run test ```

# Dockerfile Set up

1. Create and run the image from Dockerfile (make sure to route the port to port 3000 E.g: docker run -d -p 8000:3000 $IMAGE)
2. Open the container terminal
3. Start the postgres ``` service postgresql start ```
4. Create the table ``` npm run migrate ```
5. Run the server ``` npm start ```
6. Run the test ``` npm run test ```

I'm not sure how much testings should be included so I added simple testing for each layers.
I'm also not sure how the accounts were being created so I decided to create a new account each time a new account is queried.
I'm more familiar with knex.js when dealing with postgres but decided to use node-postgres instead for the simplicity.
Finally, I decided to not support trailing commas for the POST request body since body-parser operates in strict-mode.
