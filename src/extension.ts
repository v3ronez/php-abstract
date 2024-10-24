import * as vscode from "vscode";
import AbstractMethod from "./commands/abstractMethod";
export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"phpabstract.generateMethod",
		async () => {
			await new AbstractMethod().execute();
		},
	);
	context.subscriptions.push(disposable);
}
