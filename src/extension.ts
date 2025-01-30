import * as vscode from 'vscode';
import { addBookmarkIcon } from './gutter';

export interface Bookmark {
	path: string;
	position: vscode.Position;
}

export async function activate(context: vscode.ExtensionContext) {
	const bookmarks: Bookmark[] = [];

	function registerBookmark(index: number, context: vscode.ExtensionContext) {
		return vscode.commands.registerTextEditorCommand(`qbee.registerBookmark${index}`, (textEditor) => {
			let currentPosition = textEditor.selection.active;
			let bookmarkPosition = new vscode.Position(currentPosition.line, currentPosition.character);
	
			let bookmark: Bookmark = {
				path: textEditor.document.uri.fsPath,
				position: bookmarkPosition
			};
	
			bookmarks[index] = bookmark;
			vscode.window.showInformationMessage(`Successfully saved ${index} bookmark`);
	
			addBookmarkIcon(context, bookmarkPosition);
		});
	}
	
	function jumpBookmark(index: number) {
		return vscode.commands.registerCommand(`qbee.jumpBookmark${index}`, async () => {
			const bookmark = bookmarks[index];
			if (!bookmark) {
				vscode.window.showErrorMessage(`Bookmark ${index} not set`);
				return;
			}
			try {
				const document = await vscode.workspace.openTextDocument(vscode.Uri.file(bookmarks[index].path));
				const textEditor = await vscode.window.showTextDocument(document);
		
				const selection = new vscode.Selection(bookmarks[index].position, bookmarks[index].position);
				textEditor.selection = selection;
				textEditor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
		
				vscode.window.showInformationMessage(`Jump successfully to ${index}`);
			} catch (error) {
				vscode.window.showErrorMessage(`Error while jumping to bookmark ${index}`);
			}
		});
	
	}
	
	function registerCommands(context: vscode.ExtensionContext) {
		for (let i = 1; i <= 5; i++) {
			context.subscriptions.push(
				registerBookmark(i, context),
				jumpBookmark(i)
			);
		}
	}

	registerCommands(context);
}

export function deactivate() {}
