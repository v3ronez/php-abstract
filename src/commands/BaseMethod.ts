import * as vscode from "vscode";

export default class BaseMethod {
	protected document: vscode.TextDocument | undefined;
	protected editor: vscode.TextEditor | undefined;
	constructor() {
		this.document = this.getActiveDocument();
		this.editor = this.getActiveEditor();
	}
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

	getLastEndOfLastFunction() {
		if (!this.document) {
			return;
		}
		for (let line = this.document.lineCount - 1; line >= 0; line--) {
			const textLine = this.document.lineAt(line).text.trim();
			if (/\}/.test(textLine)) {
				return line;
			}
		}
	}
}
