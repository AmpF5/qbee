import * as vscode from 'vscode';
import { addBookmarkIcon, removeBookmarkIcon } from './gutter';

export interface Bookmark {
	path: string;
	position: vscode.Position;
}

export async function activate(context: vscode.ExtensionContext) {
	const bookmarks: Bookmark[] = [];
	registerCommands(context);
	restoreBookmarks();

	vscode.window.onDidChangeActiveTextEditor(() => {
        restoreBookmarks();
    });

	function registerBookmark(index: number, context: vscode.ExtensionContext) {
		return vscode.commands.registerTextEditorCommand(`qbee.registerBookmark${index}`, (textEditor) => {
			if (!textEditor) {
				vscode.window.showErrorMessage('No active text editor');
				return;
			}

			if(!vscode.window.activeTextEditor) {
				vscode.window.showErrorMessage('No active text editor');
				return;
			}

			if(bookmarks[index]) {
				vscode.window.showInformationMessage('Removing bookmark');
				removeBookmarkIcon(index, context, bookmarks[index].position);
			}

			let currentPosition = textEditor.selection.active;
			let bookmarkPosition = new vscode.Position(currentPosition.line, currentPosition.character);
			
			let bookmark: Bookmark = {
				path: textEditor.document.uri.fsPath,
				position: bookmarkPosition
			};
			bookmarks[index] = bookmark;
			vscode.window.showInformationMessage(`Successfully saved ${index} bookmark`);
	
			addBookmarkIcon(index, context, bookmarkPosition);
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

    function restoreBookmarks() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
			return;
		}

        bookmarks.forEach((bookmark, index) => {
            if (bookmark && bookmark.path === editor.document.uri.fsPath) {
                addBookmarkIcon(index, context, bookmark.position);
            }
        });
    }
}

export function deactivate() {}
