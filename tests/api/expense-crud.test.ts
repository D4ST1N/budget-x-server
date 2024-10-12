import { app } from "../../src/index";
import { getAuthenticatedRequest, setupTestEnvironment } from "../testSetup";

let authRequest: ReturnType<typeof getAuthenticatedRequest>;

beforeAll(async () => {
  await setupTestEnvironment();
  authRequest = getAuthenticatedRequest(app);
});

describe("Expense CRUD tests", () => {
  let userId: string;
  let walletId: string;
  let expenseId: string;
  let categoryId: string;
  let tagId: string;

  it("should create a new expense", async () => {
    const userDataResponse = await authRequest.get("/auth/user").expect(200);

    expect(userDataResponse.body).toHaveProperty("user");
    expect(userDataResponse.body.user).toHaveProperty("user_id");

    userId = userDataResponse.body.user.user_id;

    const walletData = {
      name: "Test Expense Wallet",
      creator: userId,
      allowedUsers: [],
    };

    const walletResponse = await authRequest
      .post("/api/wallet")
      .send(walletData)
      .expect(200);

    walletId = walletResponse.body.wallet._id;

    const categoryData = {
      name: "Test Category",
      walletId,
    };

    const categoryResponse = await authRequest
      .post(`/api/wallet/${walletId}/category`)
      .send(categoryData)
      .expect(200);

    categoryId = categoryResponse.body.category._id;

    const tagData = {
      name: "Test Tag",
    };

    const tagResponse = await authRequest
      .post(`/api/wallet/${walletId}/tag`)
      .send(tagData)
      .expect(200);

    tagId = tagResponse.body.tag._id;

    const date = new Date();
    const expenseData = {
      categoryId,
      tagIds: [tagId],
      amount: 100,
      date,
      isIncome: false,
    };

    const response = await authRequest
      .post(`/api/wallet/${walletId}/expense`)
      .send(expenseData)
      .expect(200);

    expect(response.body.expense).toHaveProperty("_id");
    expect(response.body.expense).toHaveProperty("categoryId", categoryId);
    expect(response.body.expense).toHaveProperty("amount", 100);
    expect(response.body.expense).toHaveProperty("walletId", walletId);
    expect(response.body.expense).toHaveProperty("tagIds");
    expect(response.body.expense.tagIds).toBeInstanceOf(Array);
    expect(response.body.expense.tagIds.length).toBe(1);
    expect(response.body.expense.tagIds[0]).toBe(tagId);
    expect(response.body.expense).toHaveProperty("date");
    expect(response.body.expense.date).toBe(date.toISOString());
    expect(response.body.expense).toHaveProperty("isIncome", false);

    expenseId = response.body.expense._id;
  });

  it("should retrieve the list of expenses", async () => {
    const response = await authRequest
      .get(`/api/wallet/${walletId}/expense`)
      .expect(200);

    expect(response.body.expenses).toBeInstanceOf(Array);
    expect(response.body.expenses.length).toBeGreaterThanOrEqual(1);
  });

  it("should update an existing expense", async () => {
    const newCategoryData = {
      name: "Test Category Updated",
      isIncomeCategory: true,
      walletId,
    };

    const newCategoryResponse = await authRequest
      .post(`/api/wallet/${walletId}/category`)
      .send(newCategoryData)
      .expect(200);

    const newCategoryId = newCategoryResponse.body.category._id;

    const newTagData = {
      name: "Test Tag Updated",
    };

    const newTagResponse = await authRequest
      .post(`/api/wallet/${walletId}/tag`)
      .send(newTagData)
      .expect(200);

    const newTagId = newTagResponse.body.tag._id;
    const newDate = new Date();
    const updatedExpenseData = {
      amount: 200,
      date: newDate,
      categoryId: newCategoryId,
      tagIds: [newTagId],
      isIncome: true,
    };

    const response = await authRequest
      .patch(`/api/wallet/${walletId}/expense/${expenseId}`)
      .send(updatedExpenseData)
      .expect(200);

    expect(response.body.expense).toHaveProperty("_id");
    expect(response.body.expense).toHaveProperty("categoryId", newCategoryId);
    expect(response.body.expense).toHaveProperty("amount", 200);
    expect(response.body.expense).toHaveProperty("walletId", walletId);
    expect(response.body.expense).toHaveProperty("tagIds");
    expect(response.body.expense.tagIds).toBeInstanceOf(Array);
    expect(response.body.expense.tagIds.length).toBe(1);
    expect(response.body.expense.tagIds[0]).toBe(newTagId);
    expect(response.body.expense).toHaveProperty("date");
    expect(response.body.expense.date).toBe(newDate.toISOString());
    expect(response.body.expense).toHaveProperty("isIncome", true);
  });

  it("should delete an existing expense", async () => {
    const response = await authRequest
      .delete(`/api/wallet/${walletId}/expense/${expenseId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it("should create list of expenses", async () => {
    const expensesData = {
      expenses: [
        {
          categoryId,
          tagIds: [tagId],
          amount: 100,
          date: new Date(),
          isIncome: false,
        },
        {
          categoryId,
          tagIds: [tagId],
          amount: 200,
          date: new Date(),
          isIncome: false,
        },
      ],
    };

    const response = await authRequest
      .post(`/api/wallet/${walletId}/expense/bulk`)
      .send(expensesData)
      .expect(200);

    expect(response.body.expenses).toBeInstanceOf(Array);
    expect(response.body.expenses.length).toBe(2);
  });

  it("should delete all expenses for category", async () => {
    const response = await authRequest
      .delete(`/api/wallet/${walletId}/category/${categoryId}/expense`)
      .expect(200);

    expect(response.body).toHaveProperty("deletedCount");
    expect(response.body.deletedCount).toBeGreaterThanOrEqual(2);
  });
});
