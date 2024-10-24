import * as vscode from "vscode";
export default class AbstractMethod {
	async execute() {
		const editor = await this.getActiveEditor();
		if (!editor) {
			return;
		}
		const document = await this.activeDocument();
		if (!document) {
			return;
		}
		const methodName =
			(await this.generateMethodName(document)) ?? "methodName";

		const lineToAddNewMethod =
			(await this.getLineToInsertMethod(document)) ?? document.lineCount - 1;
		await this.insertNewMethod(methodName, lineToAddNewMethod);
	}

	async getActiveEditor() {
		return vscode.window.activeTextEditor;
	}

	async activeDocument() {
		return vscode.window.activeTextEditor?.document;
	}

	async insertNewMethod(methodName: string, line: number) {
		const method = `\tprivate function ${methodName}()\n\t{\n\t\t//\n\t}\n\n`;
		const editor = await this.getActiveEditor();
		editor?.edit((e) => {
			e.insert(new vscode.Position(line, 0), method);
		});
	}

	async getLineToInsertMethod(document: vscode.TextDocument) {
		let currentLine = await this.getCurrentLine();
		if (!currentLine) {
			return;
		}
		for (currentLine; currentLine < document.lineCount - 1; currentLine++) {
			const textLine = document.lineAt(currentLine).text.trim();
			if (/\}/.test(textLine)) {
				return currentLine + 2;
			}
		}
	}

	async generateMethodName(document: vscode.TextDocument) {
		const doc = await vscode.workspace.openTextDocument(document.uri);
		const currentPosition = await this.getActiveEditor();
		const methodName = document.getText(currentPosition?.selection);
		if (!methodName) {
			const position = currentPosition?.selection.active.line;
			if (!position) {
				return;
			}
			const currentLinetext = doc.lineAt(position).text.trim();
			const methodNameExists = currentLinetext.match(/->([\w-]+)\(/);
			if (!methodNameExists) {
				return;
			}
			return methodNameExists[1];
		}
	}

	async getCurrentLine() {
		const currentPosition = await this.getActiveEditor();
		if (!currentPosition) {
			return;
		}
		return currentPosition?.selection.active.line;
	}
}
