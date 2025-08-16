import './env.js'
import cassandra from 'cassandra-driver';
import "@tensorflow/tfjs-node";
import us_encoder from "@tensorflow-models/universal-sentence-encoder";

let client;
let model;

export const TimeUuid = cassandra.types.TimeUuid;

export const { CASSANDRA_KEYSPACE, CASSANDRA_TABLE } = process.env

// function to connect to the database and return a client.
export async function connectToCassandra() {
  client = new cassandra.Client({
    contactPoints: [process.env.CASSANDRA_HOST],
    port: process.env.CASSANDRA_PORT,
    localDataCenter: 'datacenter1',
    authProvider: new cassandra.auth.PlainTextAuthProvider(process.env.CASSANDRA_USER, process.env.CASSANDRA_PASS)
  });

  await client.connect();
  console.log('Connected to Cassandra');
  return client;
}

// method that ensures there is a keyspace and table created in the database.
export async function ensureKeyspaceAndTable(tableFieldsQuery) {
  console.log(`Ensuring KEYSPACE  ${CASSANDRA_KEYSPACE} and TABLE ${CASSANDRA_TABLE} exists ...`);
  const keyspaceQuery = `CREATE KEYSPACE IF NOT EXISTS ${CASSANDRA_KEYSPACE} WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};`;
  await client.execute(keyspaceQuery);

  const tableQuery = `CREATE TABLE IF NOT EXISTS ${CASSANDRA_KEYSPACE}.${CASSANDRA_TABLE} (
        id timeuuid PRIMARY KEY,
        ${tableFieldsQuery},
        embedding VECTOR <FLOAT, 512>
    );`;
  await client.execute(tableQuery);
  console.log(`KEYSPACE  ${CASSANDRA_KEYSPACE} and TABLE ${CASSANDRA_TABLE} created`);

  // Ensure the vector index exists for efficient vector search
  const indexQuery = `CREATE INDEX IF NOT EXISTS ann_index on ${CASSANDRA_KEYSPACE}.${CASSANDRA_TABLE}(embedding) USING 'sai';`;
  await client.execute(indexQuery);
  console.log('index created');
}

// we cache the model so we don't have to fetch it every time
async function loadModel() {
  if (!model) {
    model = await us_encoder.load();
  }
}

export async function vectorizeText(text) {
  await loadModel();
  const embeddings = await model.embed([text]);
  return embeddings.arraySync()[0]; // return the first embedding
}

export async function closeCassandraConnection() {
  if (client) {
    await client.shutdown();
    console.log('Cassandra connection closed');
  }
}

