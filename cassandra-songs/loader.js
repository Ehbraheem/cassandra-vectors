import fs from "fs";
import csv from "csv-parser";
import {
  connectToCassandra,
  ensureKeyspaceAndTable,
  vectorizeText,
  closeCassandraConnection,
  TimeUuid,
  CASSANDRA_KEYSPACE,
  CASSANDRA_TABLE,
} from "../utils/util.js";

async function loadVectorizedData() {
  const client = await connectToCassandra(); // Ensure keyspace and table are set up here
  await ensureKeyspaceAndTable(`
    artist text,
    title text,
    year int,
    sales float,
    streams float,
    downloads float,
    radio_plays float,
    rating float
    `);

  const operations = []; // To store all the async operations

  const dataStream = fs
    .createReadStream("./data/songs.csv")
    .pipe(csv())
    .on("data", (row) => {
      dataStream.pause();

      const operation = async () => {
        try {
          const sentence = row["Title"];
          console.log(`read sentence: ${sentence}`);
          const embedding = await vectorizeText(sentence);
          const query = `INSERT INTO ${CASSANDRA_KEYSPACE}.${CASSANDRA_TABLE} (id, artist, downloads, embedding, radio_plays, rating, sales, streams, title, year)
                    VALUES (${TimeUuid.now()}, '${row["Artist"]}', ${parseFloat(
            row["Downloads"]
          )}, [${embedding}], ${parseFloat(row["Radio Plays"])}, ${parseFloat(
            row["Rating"]
          )}, ${parseFloat(row["Sales"])}, ${parseFloat(
            row["Streams"]
          )}, '${sentence}', ${parseInt(row["Year"])});`;

          await client.execute(query);
          console.log(`Inserted sentence: ${sentence}`);
        } catch (error) {
          console.error("Error inserting data:", error);
        } finally {
          dataStream.resume();
        }
      };

      // push the promise to the array; the promise has not been executed yet
      operations.push(operation());
    })
    .on("end", async () => {
      // Wait for all operations to complete before closing the connection
      await Promise.all(operations);
      await closeCassandraConnection();
      console.log("Finished loading data");
    });

  dataStream.read(); // Start reading from the stream
}

loadVectorizedData();
