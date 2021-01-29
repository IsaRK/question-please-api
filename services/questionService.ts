import { CosmosClient } from "@azure/cosmos";
import { exception } from "console";
import { isContext } from "vm";

// Set connection string from CONNECTION_STRING value in local.settings.json
const CONNECTION_STRING = process.env.CONNECTION_STRING;

const questionService = {
  init() {
    try {
      this.client = new CosmosClient(CONNECTION_STRING);

      if (this.client === undefined) {
        throw new exception("questionService.client is undefined");
      }

      this.database = this.client.database("questionplease");
      if (this.database === undefined) {
        throw new exception("questionService.database is undefined");
      }

      this.container = this.database.container("questions");
      if (this.container === undefined) {
        throw new exception("questionService.container is undefined");
      }

    } catch (err) {
      console.log(err.message);
    }
  },

  async create(questionToCreate) {
    const { resource } = await this.container.items.create(questionToCreate);
    return resource;
  },

  async readAll(): Promise<string> {
    const iterator = this.container.items.readAll();
    const { resources } = await iterator.fetchAll();
    return JSON.stringify(resources);
  },

  async readOne(id: string): Promise<string> {
    const queryOne = {
      query: "SELECT * from c WHERE c.id = \"" + id + "\""
    };

    console.log("Executing query :" + String(queryOne));
    const { resources } = await this.container.items.query(queryOne).fetchAll();
    return JSON.stringify(resources);
  },
};

questionService.init();

export default questionService;