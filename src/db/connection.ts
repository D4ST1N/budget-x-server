import mongoose from "mongoose";

import "dotenv/config";

const connectionString: string = process.env.MONGO_DB_CONNECTION_URL as string;
const connection = mongoose.createConnection(connectionString);

const connectToDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      autoIndex: true,
    });
  } catch (error) {
    console.error(error);
  }
};

connectToDB();

export default connection;
