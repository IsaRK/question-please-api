import { UserDefinedFunctionResponse } from "@azure/cosmos";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import questionService from "../services/questionService";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('ReadQuestion HTTP trigger function processed a request.');
  let response;

  /*
  context.log("*** Init Service ***");
  questionService.init(context);
  context.log("*** Inited Service ***");
  */

  var id = context.bindingData.id;

  try {
    let question;

    if (questionService === undefined) {
      throw new Error("Question service is undefined");
    }

    if (id === undefined) {
      question = await questionService.readAll(context);
    }
    else {
      question = await questionService.readOne(context, String(id));
    }

    response = { body: question, status: 200 };

  } catch (err) {
    context.log("*** App Logs *** Error catched");
    response = { body: err.message, status: 500 };
  }

  context.res = response;
};

export default httpTrigger;