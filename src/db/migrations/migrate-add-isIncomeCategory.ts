import mongoose from "mongoose";

import Category from "../../models/Category";

import "dotenv/config";

const connectionString: string = process.env.MONGO_DB_CONNECTION_URL as string;

async function addIsIncomeCategoryField() {
  try {
    await mongoose.connect(connectionString, {
      autoIndex: true,
    });

    console.log("Підключено до бази даних");

    const result = await Category.updateMany(
      {},
      { $set: { isIncomeCategory: false } }
    );

    console.log(`Оновлено ${result.modifiedCount} документів`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Помилка міграції:", error);
  }
}

addIsIncomeCategoryField();
