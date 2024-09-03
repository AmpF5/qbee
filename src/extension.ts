import * as vscode from 'vscode';

export interface Bookmark {
	path: string;
	position: vscode.Position;
}

export async function activate(context: vscode.ExtensionContext) {
	const bookmarks: Bookmark[] = [];

	function registerBookmark(index: number){
		return vscode.commands.registerTextEditorCommand(`qbee.registerBookmark${index}`, (textEditor) => {
			let currentPosition = textEditor!.selection.active;
			let bookmarkPosition : vscode.Position= new vscode.Position(currentPosition.line, currentPosition.character);
			
			let bookmark: Bookmark = {
				path: textEditor.document.uri.fsPath,
				position: bookmarkPosition
			};

			bookmarks[index] = bookmark;
			vscode.window.showInformationMessage(`Successfully saved ${index} bookmark`);
		});
	}
	
	function jumpBookmark(index: number) {
		return vscode.commands.registerCommand(`qbee.jumpBookmark${index}`, async () => {
			const document = await vscode.workspace.openTextDocument(vscode.Uri.file(bookmarks[index].path));
			const textEditor = await vscode.window.showTextDocument(document);
	
			const bookmark = new vscode.Selection(bookmarks[index].position, bookmarks[index].position);
			textEditor.selection = bookmark;
			textEditor.revealRange(bookmark, vscode.TextEditorRevealType.InCenter);
	
			vscode.window.showInformationMessage(`Jump successfully to ${index}`);
		});
	
	}

	for (let i = 1; i <= 5; i++) {
		const disposableRegisterBookmark = registerBookmark(i);
		context.subscriptions.push(disposableRegisterBookmark);

		const disposableJumpBookmark = jumpBookmark(i);
		context.subscriptions.push(disposableJumpBookmark);
	};
}

export function deactivate() {}
