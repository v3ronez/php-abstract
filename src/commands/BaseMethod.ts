import * as vscode from "vscode";

export default class BaseMethod {
	getActiveEditor() {
		return vscode.window.activeTextEditor;
	}

	getActiveDocument() {
		return vscode.window.activeTextEditor?.document;
	}

	getCurrentLine() {
		const currentPosition = this.getActiveEditor();
		if (!currentPosition) {
			return;
		}
		return currentPosition?.selection.active.line + 1;
	}
}
