import { CosmosClient } from "@azure/cosmos";
import { Context } from "@azure/functions";
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import { CosmosDBManagementClient } from "@azure/arm-cosmosdb";

// Set connection string from CONNECTION_STRING value in local.settings.json
const CONNECTION_STRING = process.env.CONNECTION_STRING;
const SUBSCRIPTION_ID = process.env["AZURE_SUBSCRIPTION_ID"];
const RESSOURCE_GROUPNAME = process.env["RESSOURCE_GROUPNAME"];
const ACCOUNT_NAME = process.env["ACCOUNT_NAME"];

const questionService = {
  init(context: Context | undefined) {
    try {

      let keys;

      const options: msRestNodeAuth.MSIAppServiceOptions = {
        // The clientId of the managed identity you would like the token for.
        // Required, if your app service has user-assigned managed identities.
        //
        //     clientId: "your-managed-identity-client-id"
        //
      }

      msRestNodeAuth.loginWithAppServiceMSI(options).then((msiTokenRes) => {
        console.log(msiTokenRes);

        const client = new CosmosDBManagementClient(msiTokenRes, SUBSCRIPTION_ID);
        const resourceGroupName = RESSOURCE_GROUPNAME;
        const accountName = ACCOUNT_NAME;

        client.databaseAccounts.listKeys(resourceGroupName, accountName).then((result: any) => {
          console.log("The result is:");
          console.log(result);
          keys = result;
        });

      }).catch((err) => {
        console.log(err);
      });


      this.client = new CosmosClient({ endpoint: CONNECTION_STRING, key: keys.primaryMasterKey });

      if (this.client === undefined) {
        throw new Error("questionService.client is undefined");
      }

      this.database = this.client.database("questionplease");
      if (this.database === undefined) {
        throw new Error("questionService.database is undefined");
      }

      this.container = this.database.container("questions");
      if (this.container === undefined) {
        throw new Error("questionService.container is undefined");
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
      throw new Error("this.Container in ReadAll is undefined");
    }

    if (this.container.items === undefined) {
      context.log("*** this.Container Item is undefined ***");
      throw new Error("this.Container.items in ReadAll is undefined");
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
      this.init(context);
    }

    if (this.container.items === undefined) {
      context.log("*** this.Container Item is undefined ***");
      throw new Error("this.Container.items in ReadOne is undefined");
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

questionService.init(undefined);

export default questionService;