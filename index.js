const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const fs = require('fs');
const path = require('path');
const schema = require('./schema');

const app = express();
const DATA_FILE = path.join(__dirname, 'restaurants.json');

// ─── Helper: Read data from JSON file ────────────────────────────────────────
function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// ─── Helper: Write data to JSON file ─────────────────────────────────────────
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Helper: Generate a simple unique ID ─────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// ─── Root Resolver (All 5 operations) ────────────────────────────────────────
const root = {

  // 1. QUERY: Get a single restaurant by ID
  restaurant: ({ id }) => {
    const restaurants = readData();
    const found = restaurants.find((r) => r.id === id);
    if (!found) {
      throw new Error(`Restaurant with id "${id}" not found.`);
    }
    return found;
  },

  // 2. QUERY: Get all restaurants
  restaurants: () => {
    return readData();
  },

  // 3. MUTATION: Create a new restaurant
  setrestaurant: ({ input }) => {
    const restaurants = readData();
    const newRestaurant = {
      id: generateId(),
      name: input.name || '',
      description: input.description || '',
      cuisine: input.cuisine || '',
      rating: input.rating || 0.0,
      address: input.address || '',
    };
    restaurants.push(newRestaurant);
    writeData(restaurants);
    return newRestaurant;
  },

  // 4. MUTATION: Delete a restaurant by ID
  Deleterestaurant: ({ id }) => {
    const restaurants = readData();
    const index = restaurants.findIndex((r) => r.id === id);
    if (index === -1) {
      return { ok: false, id, message: `Restaurant with id "${id}" not found.` };
    }
    restaurants.splice(index, 1);
    writeData(restaurants);
    return { ok: true, id, message: `Restaurant with id "${id}" deleted successfully.` };
  },

  // 5. MUTATION: Edit/update a restaurant by ID
  editrestaurant: ({ id, input }) => {
    const restaurants = readData();
    const index = restaurants.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Restaurant with id "${id}" not found.`);
    }
    // Merge existing fields with new input
    restaurants[index] = {
      ...restaurants[index],
      ...input,
      id, // ensure id is not overwritten
    };
    writeData(restaurants);
    return restaurants[index];
  },
};

// ─── GraphQL Middleware ───────────────────────────────────────────────────────
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true, // Enable the browser-based GraphiQL playground
  })
);

// ─── Root route redirect ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/graphql');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 GraphQL Restaurant Server is running!`);
  console.log(`   Open GraphiQL at: http://localhost:${PORT}/graphql\n`);
  console.log(`📋 Available Operations:`);
  console.log(`   Queries   → restaurant(id)  |  restaurants`);
  console.log(`   Mutations → setrestaurant   |  editrestaurant  |  Deleterestaurant\n`);
});

// ─── Handle Port Already In Use Error ────────────────────────────────────────
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error(`   Please close the other process using port ${PORT} and try again.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
