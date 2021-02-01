import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import questionService from "../services/questionService";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('CreateQuestion HTTP trigger function processed a request.');

  let response;

  questionService.init(undefined);

  try {
    const question = req.body;
    const result = await questionService.create(context, question);
    response = { body: result, status: 200 };
  } catch (err) {
    response = { body: err.message, status: 500 };
  }

  context.res = response;
};

export default httpTrigger;