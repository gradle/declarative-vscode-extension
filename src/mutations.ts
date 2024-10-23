import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

type MutationParameterType = "string" | "boolean" | "int";

interface MutationCodeActionParameter {
  documentUri: string;
  mutationId: string;
  mutationParameters: MutationCodeActionMutationParameter[];
}

interface MutationCodeActionMutationParameter {
  name: string;
  description: string;
  type: MutationParameterType;
}

interface MutationExecuteActionParameter {
  documentUri: string;
  mutationId: string;
  mutationParameters: MutationExecuteActionMutationParameter[];
}

type ResolvedMutationParameterType = string | boolean | number;

interface MutationExecuteActionMutationParameter {
  name: string;
  value: ResolvedMutationParameterType;
}

export async function handleMutationAction(
  client: LanguageClient,
  arg: MutationCodeActionParameter,
) {
  // Get the URI of the file the command was invoked
  const executeMutationParams: MutationExecuteActionMutationParameter[] = [];
  // We do a classic for loop here because we need to await each call
  for (const param of arg.mutationParameters) {
    const result = await askMutationParameter(param);
    executeMutationParams.push(result);
  }
  // Send a `gradle-dcl.executeMutation` command to the server
  const requestArguments: MutationExecuteActionParameter = {
    documentUri: arg.documentUri,
    mutationId: arg.mutationId,
    mutationParameters: executeMutationParams,
  };
  await client.sendRequest("workspace/executeCommand", {
    command: "gradle-dcl.executeMutation",
    arguments: requestArguments,
  });
}

async function askMutationParameter(
  arg: MutationCodeActionMutationParameter,
): Promise<MutationExecuteActionMutationParameter> {
  const userInput = await vscode.window.showInputBox({
    prompt: arg.description,
    placeHolder: `${arg.name}: ${arg.type}`,
    validateInput: (input) => validateInput(input, arg.type),
  });

  if (userInput === undefined) {
    throw new Error("User cancelled input");
  }

  // Cast the input to the correct type
  if (arg.type === "int") {
    return {
      name: arg.name,
      value: parseInt(userInput),
    };
  }
  if (arg.type === "boolean") {
    return {
      name: arg.name,
      value: userInput === "true",
    };
  }
  if (arg.type === "string") {
    return {
      name: arg.name,
      value: userInput,
    };
  }

  throw new Error("Invalid argument type");
}

function validateInput(input: string, kind: MutationParameterType) {
  if (input.trim() === "") {
    return "Input cannot be empty";
  }

  if (kind === "int") {
    if (isNaN(parseInt(input))) {
      return "Input must be a number";
    }
  }

  if (kind === "boolean") {
    if (input !== "true" && input !== "false") {
      return "Input must be 'true' or 'false'";
    }
  }

  return null;
}
