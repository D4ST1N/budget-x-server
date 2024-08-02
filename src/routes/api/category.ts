import express from "express";

const categoryRouter = express.Router();

categoryRouter.get("/categories", (req, res) => {
  res.send("Get all categories");
});

categoryRouter.post("/category", (req, res) => {
  res.send("Create new category");
});

export default categoryRouter;
