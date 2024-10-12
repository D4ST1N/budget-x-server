import { app } from "../../src/index";
import { getAuthenticatedRequest, setupTestEnvironment } from "../testSetup";

let authRequest: ReturnType<typeof getAuthenticatedRequest>;

beforeAll(async () => {
  await setupTestEnvironment();
  authRequest = getAuthenticatedRequest(app);
});

describe("Category CRUD tests", () => {
  let userId: string;
  let walletId: string;
  let categoryId: string;

  it("should create a new category", async () => {
    const userDataResponse = await authRequest.get("/auth/user").expect(200);

    expect(userDataResponse.body).toHaveProperty("user");
    expect(userDataResponse.body.user).toHaveProperty("user_id");

    userId = userDataResponse.body.user.user_id;

    const walletData = {
      name: "Test Category Wallet",
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

    const response = await authRequest
      .post(`/api/wallet/${walletId}/category`)
      .send(categoryData)
      .expect(200);

    expect(response.body.category).toHaveProperty("_id");
    expect(response.body.category).toHaveProperty("name", "Test Category");
    expect(response.body.category).toHaveProperty("walletId", walletId);
    expect(response.body.category).toHaveProperty("parentCategory", null);
    expect(response.body.category).toHaveProperty("isIncomeCategory", false);

    categoryId = response.body.category._id;
  });

  it("should create a subcategory", async () => {
    const categoryData = {
      name: "Test Subcategory",
      walletId,
      parentCategory: categoryId,
    };

    const response = await authRequest
      .post(`/api/wallet/${walletId}/category`)
      .send(categoryData)
      .expect(200);

    expect(response.body.category).toHaveProperty("_id");
    expect(response.body.category).toHaveProperty("name", "Test Subcategory");
    expect(response.body.category).toHaveProperty("walletId", walletId);
    expect(response.body.category).toHaveProperty("parentCategory", categoryId);
    expect(response.body.category).toHaveProperty("isIncomeCategory", false);
  });

  it("should retrieve the list of categories", async () => {
    const response = await authRequest
      .get(`/api/wallet/${walletId}/category`)
      .expect(200);

    expect(response.body.categories).toBeInstanceOf(Array);
    expect(response.body.categories.length).toBeGreaterThanOrEqual(1);
  });

  it("should update an existing category", async () => {
    const updatedCategoryData = {
      name: "Updated Category",
    };

    const response = await authRequest
      .patch(`/api/wallet/${walletId}/category/${categoryId}`)
      .send(updatedCategoryData)
      .expect(200);

    expect(response.body.category).toHaveProperty("_id", categoryId);
    expect(response.body.category).toHaveProperty("name", "Updated Category");
  });

  it("should delete an existing category", async () => {
    const response = await authRequest
      .delete(`/api/wallet/${walletId}/category/${categoryId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  describe("Category CRUD error handling", () => {
    it("should handle error when creating category with same name", async () => {
      const categoryData = {
        name: "Test Category",
        walletId,
      };

      const categoryResponse = await authRequest
        .post(`/api/wallet/${walletId}/category`)
        .send(categoryData)
        .expect(200);

      const response = await authRequest
        .post(`/api/wallet/${walletId}/category`)
        .send(categoryData)
        .expect(409);

      expect(response.body).toHaveProperty("errorType", "CategoryExists");

      categoryId = categoryResponse.body.category._id;
    });

    it("should handle error when creating category with not valid parent category", async () => {
      const categoryData = {
        name: "Test Category",
        walletId,
        parentCategory: "invalid-id",
      };

      const response = await authRequest
        .post(`/api/wallet/${walletId}/category`)
        .send(categoryData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "errorType",
        "ParentCategoryIdIsInvalid"
      );
    });

    it("should handle error when creating category with not existed parent category", async () => {
      const categoryData = {
        name: "Test Category",
        walletId,
        parentCategory: "60e9e8b6b7f5a8d3f4c2d7f0",
      };

      const response = await authRequest
        .post(`/api/wallet/${walletId}/category`)
        .send(categoryData)
        .expect(404);

      expect(response.body).toHaveProperty(
        "errorType",
        "ParentCategoryNotFound"
      );
    });

    it("should handle error when updating not existed category", async () => {
      const updatedCategoryData = {
        name: "Updated Category",
      };

      const response = await authRequest
        .patch(`/api/wallet/${walletId}/category/60e9e8b6b7f5a8d3f4c2d7f0`)
        .send(updatedCategoryData)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "CategoryNotFound");
    });

    it("should handle error when updating category with existing name", async () => {
      const categoryData = {
        name: "Test Category 2",
        walletId,
      };

      const categoryResponse = await authRequest
        .post(`/api/wallet/${walletId}/category`)
        .send(categoryData)
        .expect(200);

      const categoryId = categoryResponse.body.category._id;
      const updatedCategoryData = {
        name: "Test Category",
      };

      const response = await authRequest
        .patch(`/api/wallet/${walletId}/category/${categoryId}`)
        .send(updatedCategoryData)
        .expect(409);

      expect(response.body).toHaveProperty("errorType", "CategoryExists");
    });

    it("should handle error when updating category with not valid parent category", async () => {
      const updatedCategoryData = {
        parentCategory: "invalid-id",
      };

      const response = await authRequest
        .patch(`/api/wallet/${walletId}/category/${categoryId}`)
        .send(updatedCategoryData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "errorType",
        "ParentCategoryIdIsInvalid"
      );
    });

    it("should handle error when updating category with not existed parent category", async () => {
      const updatedCategoryData = {
        parentCategory: "60e9e8b6b7f5a8d3f4c2d7f0",
      };

      const response = await authRequest
        .patch(`/api/wallet/${walletId}/category/${categoryId}`)
        .send(updatedCategoryData)
        .expect(404);

      expect(response.body).toHaveProperty(
        "errorType",
        "ParentCategoryNotFound"
      );
    });

    it("should handle error when deleting not existed category", async () => {
      const response = await authRequest
        .delete(`/api/wallet/${walletId}/category/60e9e8b6b7f5a8d3f4c2d7f0`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "CategoryNotFound");
    });
  });
});
