import { createProdMockServer } from "vite-plugin-mock/es/createProdMockServer";

import testModule from "./test/index";
import userModule from "./user/index";
import systemModule from "./system/index";
import fileModule from "./file/index";
import tableModule from "./table/index";
import monitorModule from "./monitor/index";
import salesModule from "./sales";

export function setupProdMockServer() {
  createProdMockServer([
    ...testModule,
    ...userModule,
    ...systemModule,
    ...fileModule,
    ...tableModule,
    ...monitorModule,
    ...salesModule
  ]);
}
