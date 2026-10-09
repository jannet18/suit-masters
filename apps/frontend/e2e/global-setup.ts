import { prepareE2EDatabase } from "@repo/testing/e2e";

export default async function globalSetup() {
  await prepareE2EDatabase("frontend");
}
