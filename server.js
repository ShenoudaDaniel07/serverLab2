import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/connection.js";
import { graphqlHTTP } from "express-graphql";
import schema from "./schema/schema.js";
import { companyLoader, usersByCompanyLoader } from "./loaders/loaders.js";

//^ Load environment variables
dotenv.config();
//^ Connect to MongoDB
connectDB();

//* make express instance
const app = express();

//^ Enable CORS
app.use(cors());

//^ Parse JSON bodies
app.use(express.json());

//^ routes
app.get("/welcoming", (req, res) => {
  res.send("Welcome To Express Server!");
});

let x = 0;

app.use(
  "/graphql",
  graphqlHTTP((req) => {
    const context = {
      x: 0,
      companyLoader,
      usersByCompanyLoader,
    };
    console.log("GraphQL context:", context);
    return {
      schema,
      graphiql: true,
      context,
    };
  })
);

app.listen(4000, () => {
  console.log("Express endpoint: http://localhost:4000");
});
