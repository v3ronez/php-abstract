import * as vscode from "vscode";
import { MethodVisibility } from "../Enums/MethodVisibility";
import BaseMethod from "./BaseMethod";
export default class AbstractMethod extends BaseMethod {
	async execute() {
		if (!this.editor) {
			return;
		}
		if (!this.document) {
			return;
		}
		const methodName = (await this.generateMethodName()) ?? "methodName";

		const lineToAddNewMethod = this.getLineToInsertMethod();
		if (!lineToAddNewMethod) {
			return;
		}
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

	getLineToInsertMethod() {
		return this.getLastEndOfLastFunction();
		//[TODO] HOW TO GET THE LAST BRACKET OF CURRENT FUNCTION?
		// if (!this.document) {
		// 	return;
		// }
		// let currentLine = this.getCurrentLine();
		// if (!currentLine) {
		// 	return this.document.lineCount - 1;
		// }
		// for (currentLine; currentLine > 0; currentLine--) {
		// 	const textLine = this.document.lineAt(currentLine).text.trim();
		// 	const match = textLine.match(/function\s+(\w+)\s*\(/);
		// 	if (match) {
		// 		const currentMethodName = match[1];
		// 		return this.getEndOfCurrentMethod(currentMethodName);
		// 	}
		// }
		// return this.getLastEndOfLastFunction();
	}

	async getEndOfCurrentMethod(currentMethodName: string) {
		if (!this.document) {
			return;
		}
		const symbols = await vscode.commands.executeCommand(
			"vscode.executeDocumentSymbolProvider",
			this.document?.uri,
		);
		if (!symbols) {
			return;
		}
		//@ts-ignore
		const childrens = symbols[1].children as Array<vscode.DocumentSymbol>;
		for (const child of childrens) {
			if (
				child.kind === vscode.SymbolKind.Method &&
				child.name === currentMethodName
			) {
				return child.range.end.line;
			}
		}
	}

	async generateMethodName() {
		if (!this.document) {
			return;
		}
		const doc = await vscode.workspace.openTextDocument(this.document.uri);
		const currentPosition = this.getActiveEditor();
		const methodName = this.document.getText(currentPosition?.selection);
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
		if (!this.document) {
			return;
		}
		const line = this.getLineToInsertMethod();
		if (!line) {
			return;
		}
		if (!match) {
			return this.insertNewMethod("methodName", line, MethodVisibility.PUBLIC);
		}
		return this.insertNewMethod(match[1], line, MethodVisibility.STATIC);
	}
}
