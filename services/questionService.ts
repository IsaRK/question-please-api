import { CosmosClient, UserDefinedFunctionResponse } from "@azure/cosmos";
import { Console, exception } from "console";
import { inherits } from "util";

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
    if (this.container === undefined) {
      throw new exception("this.Container in ReadAll is undefined");
    }

    if (this.container.items === undefined) {
      throw new exception("this.Container.items in ReadAll is undefined");
    }

    const iterator = this.container.items.readAll();
    const { resources } = await iterator.fetchAll();
    return JSON.stringify(resources);
  },

  async readOne(id: string): Promise<string> {
    /*
    const queryOne = {
      query: "SELECT * from c WHERE c.id = \"" + id + "\""
    };

    if (this.container === undefined) {
      throw new exception("this.Container in ReadOne is undefined");
    }

    if (this.container.items === undefined) {
      throw new exception("this.Container.items in ReadOne is undefined");
    }

    console.log("Executing query :" + String(queryOne));
    const { resources } = await this.container.items.query(queryOne).fetchAll();
    */
    const resources = {
      "id": id,
      "container": this.container === undefined,
      "items": this.container.items === undefined
    };
    return JSON.stringify(resources);
  },

  isContainerUndefined(): boolean {
    return this.container === undefined
  },

  isContainerItemsUndefined(): boolean {
    return this.container.items === undefined
  },
};

questionService.init();
console.log("Init new question Service");

export default questionService;