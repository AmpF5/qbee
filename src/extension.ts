import * as vscode from 'vscode';

export interface Bookmark {
	path: string;
	position: vscode.Position;
}

export async function activate(context: vscode.ExtensionContext) {
	const bookmarks: Bookmark[] = [];

	const registerBookmark1 = vscode.commands.registerTextEditorCommand('qbee.registerBookmark1', (textEditor) => {
		let currentPosition = textEditor!.selection.active;
		let bookmarkPosition : vscode.Position= new vscode.Position(currentPosition.line, currentPosition.character);
		
		let bookmark1: Bookmark = {
			path: textEditor.document.uri.fsPath,
			position: bookmarkPosition
		};

		bookmarks[0] = bookmark1;
		vscode.window.showInformationMessage('Save successfully');
	});

	const jumpBookmark1 = vscode.commands.registerCommand('qbee.jumpBookmark1', async () => {
		const document = await vscode.workspace.openTextDocument(vscode.Uri.file(bookmarks[0].path));
		const textEditor = await vscode.window.showTextDocument(document);

		const bookmark = new vscode.Selection(bookmarks[0].position, bookmarks[0].position);
		textEditor.selection = bookmark;
		textEditor.revealRange(bookmark, vscode.TextEditorRevealType.InCenter);

		vscode.window.showInformationMessage('Jump successfully');
	});

	context.subscriptions.push(registerBookmark1);
	context.subscriptions.push(jumpBookmark1);
}

// This method is called when your extension is deactivated
export function deactivate() {}
