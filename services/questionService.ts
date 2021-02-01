import { CosmosClient, UserDefinedFunctionResponse } from "@azure/cosmos";
import { Context } from "@azure/functions";
import { Console, exception } from "console";
import { inherits } from "util";

// Set connection string from CONNECTION_STRING value in local.settings.json
const CONNECTION_STRING = process.env.CONNECTION_STRING;

const questionService = {
  init() {
    try {
      this.client = new CosmosClient(CONNECTION_STRING);

      if (this.client === undefined) {
        throw exception("questionService.client is undefined");
      }

      this.database = this.client.database("questionplease");
      if (this.database === undefined) {
        throw exception("questionService.database is undefined");
      }

      this.container = this.database.container("questions");
      if (this.container === undefined) {
        throw exception("questionService.container is undefined");
      }

    } catch (err) {
      console.log(err.message);
    }
  },

  async create(context: Context, questionToCreate) {
    context.log("*** Creating new Question");
    const { resource } = await this.container.items.create(questionToCreate);
    return resource;
  },

  async readAll(context: Context): Promise<string> {
    if (this.container === undefined) {
      context.log("*** this.Container is undefined ***");
      throw exception("this.Container in ReadAll is undefined");
    }

    if (this.container.items === undefined) {
      context.log("*** this.Container Item is undefined ***");
      throw exception("this.Container.items in ReadAll is undefined");
    }

    context.log("*** All context is defined ***");

    const iterator = this.container.items.readAll();
    const { resources } = await iterator.fetchAll();
    return JSON.stringify(resources);
  },

  async readOne(context: Context, id: string): Promise<string> {

    const queryOne = {
      query: "SELECT * from c WHERE c.id = \"" + id + "\""
    };

    context.log("*** QueryOne is " + queryOne);

    if (this.container === undefined) {
      context.log("*** this.Container is undefined ***");
      throw exception("this.Container in ReadOne is undefined");
    }

    if (this.container.items === undefined) {
      context.log("*** this.Container Item is undefined ***");
      throw exception("this.Container.items in ReadOne is undefined");
    }

    console.log("Executing query :" + String(queryOne));

    const resources = {
      "id": id,
      "container": this.container === undefined,
      "items": this.container.items === undefined
    };

    return JSON.stringify(resources);
  },
};

export default questionService;