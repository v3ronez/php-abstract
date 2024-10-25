import * as vscode from "vscode";
import { MethodVisibility } from "../Enums/MethodVisibility";
import BaseMethod from "./BaseMethod";
export default class AbstractMethod extends BaseMethod {
	async execute() {
		const editor = this.getActiveEditor();
		if (!editor) {
			return;
		}
		const document = this.getActiveDocument();
		if (!document) {
			return;
		}
		const methodName =
			(await this.generateMethodName(document)) ?? "methodName";

		const lineToAddNewMethod = this.getLineToInsertMethod(document);
		await this.insertNewMethod(methodName, lineToAddNewMethod);
	}

	async insertNewMethod(
		methodName: string,
		line: number,
		visibility: MethodVisibility = MethodVisibility.PRIVATE,
	) {
		const method = `\t${visibility} function ${methodName}()\n\t{\n\t\t//\n\t}\n\n`;
		const editor = this.getActiveEditor();
		editor?.edit((e) => {
			e.insert(new vscode.Position(line, 0), method);
		});
	}

	getLineToInsertMethod(document: vscode.TextDocument) {
		let currentLine = this.getCurrentLine();
		if (!currentLine) {
			return document.lineCount - 1;
		}
		for (currentLine; currentLine < document.lineCount - 1; currentLine++) {
			const textLine = document.lineAt(currentLine).text.trim();
			if (/\}/.test(textLine)) {
				return currentLine + 2;
			}
		}
		return document.lineCount - 1;
	}

	async generateMethodName(document: vscode.TextDocument) {
		const doc = await vscode.workspace.openTextDocument(document.uri);
		const currentPosition = this.getActiveEditor();
		const methodName = document.getText(currentPosition?.selection);
		if (!methodName) {
			const position = currentPosition?.selection.active.line;
			if (!position) {
				return "methodName";
			}
			const currentLinetext = doc.lineAt(position).text.trim();
			const methodNameExists = currentLinetext.match(/->([\w-]+)\(/);
			if (!methodNameExists) {
				const isStaticMethod = this.isStaticMethod(currentLinetext);
				return isStaticMethod
					? this.generateStaticMethod(currentLinetext)
					: "methodName";
			}
			return methodNameExists[1];
		}

		return "methodName";
	}

	isStaticMethod(currentLine: string): boolean {
		const isSelfMethodRegex = /\bself::/;
		if (isSelfMethodRegex.test(currentLine)) {
			return true;
		}
		return false;
	}

	async generateStaticMethod(currentLine: string) {
		const regexToGetMethodName = /self::([^()]+)\(/;
		const match = currentLine.match(regexToGetMethodName);
		const document = this.getActiveDocument();
		if (!document) {
			return;
		}
		const line = this.getLineToInsertMethod(document);
		if (!match) {
			return this.insertNewMethod("methodName", line, MethodVisibility.PUBLIC);
		}
		return this.insertNewMethod(match[1], line, MethodVisibility.STATIC);
	}
}
