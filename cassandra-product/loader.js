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
  const client = await connectToCassandra();
  await ensureKeyspaceAndTable(`
    asins text,
    brand text,
    categories text,
    colors text,
    dateAdded timestamp,
    dateUpdated timestamp,
    reviews_title text,
    reviews_userCity text,
    reviews_userProvince text,
    reviews_username text
    `);

  const operations = [];

  const dataStream = fs
    .createReadStream("./data/products.csv")
    .pipe(csv())
    .on("data", (row) => {
      dataStream.pause();

      const operation = async () => {
        try {
          const title = row["reviews.title"]
            ? row["reviews.title"].replace(/'/g, "''")
            : "";
          console.log(`Read title: ${title}`);
          const embedding = await vectorizeText(title);
          const embeddingStr = embedding
            .map((value) => value.toFixed(6))
            .join(",");

          const query = `INSERT INTO ${CASSANDRA_KEYSPACE}.${CASSANDRA_TABLE} (
                        id, asins, brand, categories, colors, dateAdded, dateUpdated, reviews_title, reviews_userCity, 
                        reviews_userProvince, reviews_username, embedding) 
                    VALUES (
                        ${TimeUuid.now()}, 
                        '${row["asins"]}', 
                        '${row["brand"]}', 
                        '${row["categories"]}', 
                        '${row["colors"]}', 
                        '${row["dateAdded"]}', 
                        '${row["dateUpdated"]}', 
                        '${title}', 
                        '${row["reviews.userCity"]}', 
                        '${row["reviews.userProvince"]}', 
                        '${row["reviews.username"]}', 
                        [${embeddingStr}]
                    );`;

          await client.execute(query);
        } catch (error) {
          console.error("Error inserting data:", error);
        } finally {
          dataStream.resume();
        }
      };

      operations.push(operation());
    })
    .on("end", async () => {
      await Promise.all(operations);
      await closeCassandraConnection();
      console.log("Finished loading data");
    });

  dataStream.read();
}

loadVectorizedData();
