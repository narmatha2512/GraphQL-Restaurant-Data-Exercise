const { buildSchema } = require('graphql');

// GraphQL Schema Definition
const schema = buildSchema(`
  type Restaurant {
    id: String
    name: String
    description: String
    cuisine: String
    rating: Float
    address: String
  }

  input RestaurantInput {
    name: String
    description: String
    cuisine: String
    rating: Float
    address: String
  }

  type DeleteResponse {
    ok: Boolean
    id: String
    message: String
  }

  type Query {
    restaurant(id: String!): Restaurant
    restaurants: [Restaurant]
  }

  type Mutation {
    setrestaurant(input: RestaurantInput): Restaurant
    Deleterestaurant(id: String!): DeleteResponse
    editrestaurant(id: String!, input: RestaurantInput): Restaurant
  }
`);

module.exports = schema;
