import * as fs from "fs";
import * as vscode from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import { handleMutationAction as handleApplyMutation } from "./mutations";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("gradle.declarative")) {
      deactivate();
      activate(context);
    }
  });

  startClient();
  registerCommands(context);
}

function checkJavaHome(javaHome: string): string {
  if (!fs.existsSync(javaHome)) {
    throw new Error(`Java home path does not exist: ${javaHome}`);
  }
  if (!fs.existsSync(`${javaHome}/bin/java`)) {
    throw new Error(`Java binary does not exist: ${javaHome}/bin/java`);
  }

  return `${javaHome}/bin/java`;
}

function checkLspJar(lspJar: string): string {
  if (lspJar === undefined) {
    throw new Error("LSP JAR path is not set");
  } else if (!fs.existsSync(lspJar)) {
    throw new Error(`LSP JAR path does not exist: ${lspJar}`);
  }

  return lspJar;
}

function registerCommands(context: vscode.ExtensionContext) {
  const registerCommandDisposable = vscode.commands.registerCommand(
    "gradle-dcl.applyMutation",
    (args) => handleApplyMutation(client, args)
  );
  context.subscriptions.push(registerCommandDisposable);
}

function startClient() {
  const javaExecutable = checkJavaHome(
    vscode.workspace
      .getConfiguration("gradle.declarative")
      .get("javaHome") as string
  );
  const lspJarPath = checkLspJar(
    vscode.workspace
      .getConfiguration("gradle.declarative")
      .get("lspJar") as string
  );

  const serverOptions: ServerOptions = {
    run: {
      command: javaExecutable,
      args: ["-jar", lspJarPath],
    },
    debug: {
      command: javaExecutable,
      args: [
        "-agentlib:jdwp=transport=dt_socket,server=n,address=localhost:5015,suspend=n",
        "-jar",
        lspJarPath,
      ],
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "gradle-dcl" }],
    progressOnInitialization: true,
  };

  client = new LanguageClient(
    "gradle-declarative",
    "Declarative Gradle",
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
