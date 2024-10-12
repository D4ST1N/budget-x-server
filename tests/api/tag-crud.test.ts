import { app } from "../../src/index";
import { getAuthenticatedRequest, setupTestEnvironment } from "../testSetup";

let authRequest: ReturnType<typeof getAuthenticatedRequest>;

beforeAll(async () => {
  await setupTestEnvironment();
  authRequest = getAuthenticatedRequest(app);
});

describe("Tag CRUD tests", () => {
  let userId: string;
  let walletId: string;
  let tagId: string;

  it("should create a new tag", async () => {
    const userDataResponse = await authRequest.get("/auth/user").expect(200);

    expect(userDataResponse.body).toHaveProperty("user");
    expect(userDataResponse.body.user).toHaveProperty("user_id");

    userId = userDataResponse.body.user.user_id;

    const walletData = {
      name: "Test Tag Wallet",
      creator: userId,
      allowedUsers: [],
    };

    const walletResponse = await authRequest
      .post("/api/wallet")
      .send(walletData)
      .expect(200);

    walletId = walletResponse.body.wallet._id;

    const tagData = {
      name: "Test Tag",
    };

    const response = await authRequest
      .post(`/api/wallet/${walletId}/tag`)
      .send(tagData)
      .expect(200);

    expect(response.body.tag).toHaveProperty("_id");
    expect(response.body.tag).toHaveProperty("name", "Test Tag");
    expect(response.body.tag).toHaveProperty("walletId", walletId);

    tagId = response.body.tag._id;
  });

  it("should create a list of tags", async () => {
    const tagData = {
      tags: ["Test Tag", "Test Tag 1", "Test Tag 2"],
    };

    const response = await authRequest
      .post(`/api/wallet/${walletId}/tag/bulk`)
      .send(tagData)
      .expect(200);

    expect(response.body.createdTags).toBeInstanceOf(Array);
    expect(response.body.existingTags).toBeInstanceOf(Array);
    expect(response.body.createdTags.length).toBe(2);
    expect(response.body.existingTags.length).toBe(1);
  });

  it("should retrieve the list of tags", async () => {
    const response = await authRequest
      .get(`/api/wallet/${walletId}/tag`)
      .expect(200);

    expect(response.body.tags).toBeInstanceOf(Array);
    expect(response.body.tags.length).toBeGreaterThanOrEqual(1);
  });

  it("should update an existing tag", async () => {
    const updatedTagData = {
      name: "Updated Tag",
    };

    const response = await authRequest
      .patch(`/api/wallet/${walletId}/tag/${tagId}`)
      .send(updatedTagData)
      .expect(200);

    expect(response.body.tag).toHaveProperty("_id", tagId);
    expect(response.body.tag).toHaveProperty("name", "Updated Tag");
  });

  it("should delete an existing tag", async () => {
    const response = await authRequest
      .delete(`/api/wallet/${walletId}/tag/${tagId}`)
      .expect(200);

    expect(response.body.success).toBe(true);

    const tagsResponse = await authRequest
      .get(`/api/wallet/${walletId}/tag`)
      .expect(200);

    expect(tagsResponse.body.tags).toBeInstanceOf(Array);
    expect(tagsResponse.body.tags.length).toBeGreaterThanOrEqual(0);
  });

  describe("Tag CRUD error handling", () => {
    it("should return an error when creating a tag with an existing name", async () => {
      const tagData = {
        name: "Test Tag",
      };

      const tagResponse = await authRequest
        .post(`/api/wallet/${walletId}/tag`)
        .send(tagData)
        .expect(200);

      tagId = tagResponse.body.tag._id;

      const response = await authRequest
        .post(`/api/wallet/${walletId}/tag`)
        .send(tagData)
        .expect(409);

      expect(response.body).toHaveProperty("errorType", "TagExists");
    });

    it("should return an error when updating non existing tag", async () => {
      const response = await authRequest
        .patch(`/api/wallet/${walletId}/tag/60e9e8b6b7f5a8d3f4c2d7f0`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "TagNotFound");
    });

    it("should return an error when deleting non existing tag", async () => {
      const response = await authRequest
        .delete(`/api/wallet/${walletId}/tag/60e9e8b6b7f5a8d3f4c2d7f0`)
        .expect(404);

      expect(response.body).toHaveProperty("errorType", "TagNotFound");
    });
  });
});
