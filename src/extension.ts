import * as vscode from 'vscode';
import { addBookmarkIcon, removeBookmarkIcon } from './gutter';
import { BookmarksProvider } from './activityBar';

export interface Bookmark {
	path: string;
	position: { line: number; character: number };
}

export async function activate(context: vscode.ExtensionContext) {
	let bookmarks: Bookmark[] = context.globalState.get<Bookmark[] >('qbee.bookmarks', []) || {};
	registerCommands(context);
	restoreBookmarks();

	const bookmarksProvider = new BookmarksProvider();
  	vscode.window.registerTreeDataProvider('qBeeView', bookmarksProvider);

	vscode.window.onDidChangeActiveTextEditor(() => {
        restoreBookmarks();
    });

	vscode.workspace.onDidChangeTextDocument((event) => {
		for (const change of event.contentChanges) {
			const lineDelta = change.text.split("\n").length - 1;
	
			if (lineDelta !== 0) {
				bookmarks.forEach((bookmark, index) => {
					if (bookmark.path === event.document.uri.fsPath) {
						if (bookmark.position.line >= change.range.start.line) {
							bookmarks[index].position.line = bookmark.position.line + lineDelta;
						}
					}
				});
			}
		}
	
		storeBookmarksGlobal();
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

			let currentPosition = textEditor.selection.active;
			
			let bookmark: Bookmark = {
				path: textEditor.document.uri.fsPath,
				position: { line: currentPosition.line, character: currentPosition.character }
			};

			if(bookmarks[index]) {
				removeBookmarkIcon(index);
				
				let previousBookmark = bookmarks[index];

				if(JSON.stringify(previousBookmark) === JSON.stringify(bookmark)) {
					return;
				}
			}

			bookmarks[index] = bookmark;

			storeBookmarksGlobal();

			addBookmarkIcon(index, context, new vscode.Position(bookmark.position.line, bookmark.position.character));

			const position = textEditor.selection.active;
			const label = `${vscode.workspace.asRelativePath(textEditor.document.uri)}: ${position.line + 1}`;
			bookmarksProvider.addBookmark(index, label, position);
		});
	}
	
	function jumpBookmark(index: number) {
		return vscode.commands.registerCommand(`qbee.jumpBookmark${index}`, async () => {
			const bookmark = bookmarks[index];
			if (!bookmark) {
				return;
			}

			try {
				const document = await vscode.workspace.openTextDocument(vscode.Uri.file(bookmarks[index].path));
				const textEditor = await vscode.window.showTextDocument(document);
				const position = new vscode.Position(bookmarks[index].position.line, bookmarks[index].position.character);
				const selection = new vscode.Selection(position, position);
				textEditor.selection = selection;
				textEditor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
		
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
				const position = new vscode.Position(bookmarks[index].position.line, bookmarks[index].position.character);
                addBookmarkIcon(index, context, position);
            }
        });
    }

	function storeBookmarksGlobal() {
		context.globalState.update('qbee.bookmarks', bookmarks);
	}
}

export function deactivate() {}
