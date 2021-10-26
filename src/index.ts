import { startApi } from "./api/startApi"
import { startIndexers } from "./indexers/startIndexers";
import { startModel } from "./model/startModel";

(async () => {
  await startModel();
  await startApi();
  await startIndexers();
})()