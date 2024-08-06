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

export function activate() {
  // Get the `gradle.declarative.javaHome` configuration value
  const javaHome = workspace
    .getConfiguration("gradle.declarative")
    .get("javaHome") as string;
  const javaExecutable = checkJavaHome(javaHome);
  console.log(`Java executable used: ${javaExecutable}`);

  // Read the ../declarative-lsp/lsp/build/runtime-classpath.txt file
  const classpath = fs.readFileSync(
    "/Users/bhegyi/Developer/Coding/declarative-lsp/lsp/build/runtime-classpath.txt",
    "utf8"
  );

  const serverOptions: ServerOptions = {
    run: {
      command: javaExecutable,
      args: ["-cp", classpath, "org.gradle.declarative.lsp.MainKt"],
    },
    debug: {
      command: javaExecutable,
      args: [
        "-agentlib:jdwp=transport=dt_socket,server=n,address=localhost:5015,suspend=y",
        "-cp",
        classpath,
        "org.gradle.declarative.lsp.MainKt",
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

export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
