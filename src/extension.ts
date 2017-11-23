/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('extension.solidity-debug.getProgramName', config => {
		return vscode.window.showInputBox({
			placeHolder: "Please enter the name of a solidity file in the workspace folder"
		});
	}));

	// register a configuration provider for 'solidity' debug type
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('solidity', new SolidityConfigurationProvider()));
}

export function deactivate() {
	// nothing to do
}

class SolidityConfigurationProvider implements vscode.DebugConfigurationProvider {

 	resolveCompiledJson(path: string) {
   		// const options: vscode.OpenDialogOptions = {
     //    	canSelectMany: true,
     //     	openLabel: 'Open JSON with compilation info',
     //     	filters: {
     //        	'JSON files': ['json']
     //        }
    	// };

		return new Promise((resolve, reject) => {
			resolve();
//			vscode.window.showOpenDialog(options).then(fileUri => {
      //   	if (fileUri && fileUri[0]) {
	     //        	console.log('Selected file: ' + fileUri[0].fsPath);
	     //    	}
  //          });
		});
 	}

	 resolveRPC(rpc: string) {
		return vscode.window.showInputBox({
			placeHolder: "Please confirm RPC Network"
		});
	}

	resolveTransactionHash(transactionHash: string) {
		if (transactionHash) {
			return new Promise((resolve,reject) => {
				resolve(transactionHash);
			});
		}
		return vscode.window.showInputBox({
			placeHolder: "Cannot find compiled JSON files. Please enter path to JSON files"
		});
	}

	async resolveConfig(folder: WorkspaceFolder, config: DebugConfiguration) {
		config.type = 'solidity';
		config.name = 'Launch';
		config.request = 'launch';
		config.program = '${file}';
		config.stopOnEntry = false;
		config.compiledJson = await this.resolveCompiledJson(folder.uri.fsPath);
		config.rpc = await this.resolveRPC(config.rpc);
		config.transactionHash = await this.resolveTransactionHash(config.transactionHash);
		return config;
	}

	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
	resolveDebugConfiguration(folder: WorkspaceFolder, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'solidity' ) {
				this.resolveConfig(folder, config);
				console.log("config=", config);
			}
		}
		return config;
	}
}
