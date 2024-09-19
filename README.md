# Declarative Gradle - VSCode Extension

> [!WARNING]  
> This extension is in early development and is not yet ready for general use.

This extension provides support for [Declarative Gradle](https://github.com/gradle/declarative-gradle) feature using the [Declarative Gradle LSP](https://github.com/gradle/declarative-lsp).

## How to use

### Installation

There are two ways to install the extension

1.  Use the repository itself. Check out the code, open it up in VSCode, run `npm install`, and launch the `Extension` run configuration.
1.  Install the extension from the VSIX artifact created by the [CI pipeline](https://github.com/gradle/declarative-vscode-extension/actions/workflows/build.yml)

### Configuration

After installing the extension, two settings need to be defined.
On the UI editor, the settings can be found under the "Extensions > Gradle Declarative" menu.

The two configurations are:

- Java Home (`gradle.declarative.javaHome`): A minimum Java 8 compatible JRE, required to run the language server.
- Lsp Jar (`gradle.declarative.lspJar`): The path to the Declarative Gradle LSP JAR file. This can be acquired by checking out and building the [Declartive Gradle LSP](https://github.com/gradle/declarative-lsp) project. Please refer to the project's README for more information.

The "Output > Declarative Gradle" window should provide detailed logging.
If the extension is not working as expected, please check this output for any errors.
