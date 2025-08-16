# Cassandra Vectors

A sandbox repository for experimenting with **vector search using Cassandra**.  
This project explores how to manage vector embeddings and similarity search within a Cassandra database.

---

##  Repository Structure

| Path                      | Description                                     |
|---------------------------|-------------------------------------------------|
| `cassandra-product/`      | Example app for vector search on product data   |
| `cassandra-songs/`        | Example app for vector search on music data     |
| `utils/`                  | Shared utilities (data loading, embedding, Cassandra helpers) |
| `package.json`            | Root-level project configuration and metadata   |

---

##  Getting Started

### Clone the repository
```bash
git clone https://github.com/Ehbraheem/cassandra-vectors.git
cd cassandra-vectors
````

### Install dependencies

Install each component separately:

```bash
cd cassandra-product
npm install

cd ../cassandra-songs
npm install

cd ../utils
npm install
```

### Set up environment variables

Create a `.env` file in each package (or at the root, depending on your setup). Example entries might include:

```env
CASSANDRA_CONTACT_POINTS=127.0.0.1
CASSANDRA_KEYSPACE=vector_db
EMBEDDING_API_KEY=your_api_key_here
```

Ensure your code loads these via `dotenv` or a similar config loader from `utils/`.

### Run the example apps

#### Product Vector App

```bash
cd cassandra-product
node loader.js     # load and vectorize product data
node server.js     # expose search endpoint
```

#### Songs Vector App

```bash
cd cassandra-songs
node loader.js     # load and vectorize song data
node server.js     # expose search endpoint
```

---

## Shared Utilities

The `utils/` directory contains:

* **Data loading helpers**
* **Embedding generation logic**
* **Cassandra connectivity and query utilities**

Both example apps (`cassandra-product` and `cassandra-songs`) import from these common modules to reduce duplication and maintain consistency.

---

## What This Project Demonstrates

* **Generating vector embeddings** from structured or unstructured data.
* **Loading embeddings into Cassandra** for storage and retrieval.
* Performing **vector similarity queries** (e.g., nearest-neighbor search).
* Building minimal API servers to expose search functionality.

---

## Quick Summary

1. Clone the repo.
2. Install dependencies in each example folder.
3. Configure your `.env` files for Cassandra and embedding API access.
4. Run `loader.js` and `server.js` in each example to load data and serve vector search.
5. Use `utils/` as a toolkit for simplifying development.

---

## License

This project is licensed under the **MIT License**—see the [LICENSE](./LICENSE) file for details.

---

## Contributing

Contributions are welcome! Feel free to submit new vector search examples, improve documentation, or add utility enhancements. See the [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

