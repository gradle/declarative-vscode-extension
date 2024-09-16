import { on } from "events";
import * as fs from "fs";
import { workspace } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient;

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

export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

export function activate() {
  workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("gradle.declarative")) {
      deactivate();
      activate();
    }
  });

  const javaHome = checkJavaHome(
    workspace.getConfiguration("gradle.declarative").get("javaHome") as string
  );
  const lspJar = checkLspJar(
    workspace.getConfiguration("gradle.declarative").get("lspJar") as string
  );

  startClient(javaHome, lspJar);
}

function startClient(javaExecutable: string, lspJarPath: string) {
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
  };

  client = new LanguageClient(
    "gradle-declarative",
    "Declarative Gradle",
    serverOptions,
    clientOptions
  );

  client.start();
}
