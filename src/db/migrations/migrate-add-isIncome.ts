import mongoose from "mongoose";

import Expense from "../../models/Expense";

const connectionString: string = process.env.MONGO_DB_CONNECTION_URL as string;

async function addIsIncomeField() {
  try {
    await mongoose.connect(connectionString, {
      autoIndex: true,
    });

    console.log("Підключено до бази даних");

    const result = await Expense.updateMany({}, { $set: { isIncome: false } });

    console.log(`Оновлено ${result.modifiedCount} документів`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Помилка міграції:", error);
  }
}

addIsIncomeField();
