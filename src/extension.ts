import * as fs from 'fs'
import * as vscode from 'vscode'
import * as path from 'path'
import { exec } from 'child_process'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node'
import { handleMutationAction as handleApplyMutation } from './mutations'

let client: LanguageClient

export async function activate(context: vscode.ExtensionContext) {
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('gradle.declarative')) {
      deactivate()
      activate(context)
    }
  })

  await startClient(context)
  registerCommands(context)
}

async function getJavaExec(): Promise<string> {
  const userJavaHome = vscode.workspace
    .getConfiguration('gradle.declarative')
    .get<string>('javaHome')
  if (userJavaHome) {
    const userJavaExec = path.join(userJavaHome, 'bin', 'java')
    if (fs.existsSync(userJavaExec)) {
      return userJavaExec
    }
  }

  const locateJavaCommand =
    process.platform === 'win32' ? `where java` : `which java`
  const javaExecLocation = await new Promise<string | null>((resolve) => {
    exec(locateJavaCommand, (error, stdout) => {
      if (error) {
        resolve(null)
      } else {
        resolve(stdout.trim())
      }
    })
  })

  if (javaExecLocation) {
    return javaExecLocation
  } else {
    throw new Error(
      `Java executable not found. Please either have a 'java' executable on PATH or set the 'gradle.declarative.javaHome' configuration.`
    )
  }
}

function getLspJar(context: vscode.ExtensionContext): string {
  const userLspJar = vscode.workspace
    .getConfiguration('gradle.declarative')
    .get<string>('lspJar')
  if (userLspJar) {
    return userLspJar
  }

  return path.join(context.extensionPath, 'libs', 'lsp-all.jar')
}

function registerCommands(context: vscode.ExtensionContext) {
  const registerCommandDisposable = vscode.commands.registerCommand(
    'gradle-dcl.applyMutation',
    (args) => handleApplyMutation(client, args)
  )
  context.subscriptions.push(registerCommandDisposable)
}

async function startClient(context: vscode.ExtensionContext) {
  const javaExecutable = await getJavaExec()
  const lspJarPath = getLspJar(context)

  const serverOptions: ServerOptions = {
    run: {
      command: javaExecutable,
      args: ['-jar', lspJarPath],
    },
    debug: {
      command: javaExecutable,
      args: [
        // Optional debug parameters
        // --------------------------------------------------------------------
        // | BROKEN ATM | Option A: LSP as a debug server
        // | BROKEN ATM |           Classic debug configuration where the extension is the debug server, with IDEA as the debug client
        // | BROKEN ATM |           NOTE: This option must be used when developing in a devcontainer / docker environment
        // | BROKEN ATM |           NOTE: In a devcontainer, a java process might hang, which is not cleaned up by the extension
        // | BROKEN ATM |                 That case, you can stop all java processes by running `pkill -f java` in the terminal
        // | BROKEN ATM |           To use this, start "Attaching debugger 5010" in the LSP project
        // FIXME: Leaving this here, as I don't want to delete this option right now, but Java causes me a headache
        //        When the java process is the jdwt server, it will print a "listening for transport dt_socket at address ..." message
        //        This will break the communication between the extension and the LSP, as the client expects JSON-RPC messages
        // '-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=*:5010',

        // Option B: LSP as a debug client
        //           This option is the most transparent when the extension is running in a non-docker environment
        //           To use this, start "Listening debugger 5011" in the LSP project
        '-agentlib:jdwp=transport=dt_socket,server=n,suspend=n,address=localhost:5011',

        // Main parameters
        // --------------------------------------------------------------------
        '-jar',
        lspJarPath,
      ],
    },
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'gradle-dcl' }],
    progressOnInitialization: true,
    initializationOptions: {
      // If we are running on a fresh setup, Gradle can take significant time to initialize
      // Timeout is increased therefore to 5 minutes
      timeout: 5 * 60 * 1000,
      declarativeFeatures: {
        // We tell the LSP server that we support mutations
        mutations: true,
      },
    },
  }

  client = new LanguageClient(
    'gradle-declarative',
    'Declarative Gradle',
    serverOptions,
    clientOptions
  )

  console.log('Attempting to start Declarative LSP server')
  client.start()
}

export async function deactivate() {
  if (!client) {
    return undefined
  }
  console.log('Deactivating Declarative LSP server')
  client.stop()
}
