import { teardownTestEnvironment } from "./testSetup";

export default async (): Promise<void> => {
  await teardownTestEnvironment();
};
