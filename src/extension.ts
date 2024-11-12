import * as fs from "fs";
import * as vscode from "vscode";
import * as path from "path";
import { exec } from "child_process";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import { handleMutationAction as handleApplyMutation } from "./mutations";

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("gradle.declarative")) {
      deactivate();
      activate(context);
    }
  });

  await startClient(context);
  registerCommands(context);
}

async function getJavaExec(): Promise<string> {
  const userJavaHome = vscode.workspace
    .getConfiguration("gradle.declarative")
    .get<string>("javaHome");
  if (userJavaHome) {
    const userJavaExec = path.join(userJavaHome, "bin", "java");
    if (fs.existsSync(userJavaExec)) {
      return userJavaExec;
    }
  }

  const locateJavaCommand =
    process.platform === "win32" ? `where java` : `which java`;
  const javaExecLocation = await new Promise<string | null>((resolve) => {
    exec(locateJavaCommand, (error, stdout) => {
      if (error) {
        resolve(null);
      } else {
        resolve(stdout.trim());
      }
    });
  });
  if (javaExecLocation) {
    return javaExecLocation;
  }

  throw new Error(
    `Java executable not found. Please either have a 'java' executable on PATH or set the 'gradle.declarative.javaHome' configuration.`
  );
}

function getLspJar(context: vscode.ExtensionContext): string {
  const userLspJar = vscode.workspace
    .getConfiguration("gradle.declarative")
    .get<string>("lspJar");
  if (userLspJar) {
    return userLspJar;
  }

  return path.join(context.extensionPath, "libs", "lsp-all.jar");
}

function registerCommands(context: vscode.ExtensionContext) {
  const registerCommandDisposable = vscode.commands.registerCommand(
    "gradle-dcl.applyMutation",
    (args) => handleApplyMutation(client, args)
  );
  context.subscriptions.push(registerCommandDisposable);
}

async function startClient(context: vscode.ExtensionContext) {
  const javaExecutable = await getJavaExec();
  const lspJarPath = getLspJar(context);

  const serverOptions: ServerOptions = {
    run: {
      command: javaExecutable,
      args: ["-jar", lspJarPath],
    },
    debug: {
      command: javaExecutable,
      args: [
        "-agentlib:jdwp=transport=dt_socket,server=n,address=localhost:5015,suspend=y",
        "-jar",
        lspJarPath,
      ],
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "gradle-dcl" }],
    progressOnInitialization: true,
    initializationOptions: {
      // If we are running on a fresh setup, Gradle can take significant time to initialize
      // Timeout is increased therefore to 5 minutes
      timeout: 5 * 60 * 1000,
    },
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
