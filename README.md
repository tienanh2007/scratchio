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
