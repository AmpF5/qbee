import * as vscode from 'vscode';
import { addBookmarkIcon, removeAllBookmarksFromGutter, removeBookmarkIcon } from './gutter';
import { BookmarksProvider } from './activityBar';

export interface Bookmark {
	index: number,
	path: string,
	fileName: string,
	position: { line: number; character: number };
}

export async function activate(context: vscode.ExtensionContext) {
	let bookmarks: Bookmark[] = context.globalState.get<Bookmark[] >('qbee.bookmarks', []) || {};
	registerCommands(context);
	restoreBookmarks();

	const bookmarksProvider = new BookmarksProvider();
  	vscode.window.registerTreeDataProvider('qBeeView', bookmarksProvider);
	bookmarksProvider.loadBookmarks(bookmarks);

	vscode.window.onDidChangeActiveTextEditor(() => {
        restoreBookmarks();
    });

	vscode.workspace.onDidChangeTextDocument((event) => {
		for (const change of event.contentChanges) {
			const lineDelta = change.text.split("\n").length - 1;
	
			if (lineDelta !== 0) {
				bookmarks = bookmarks.map((bookmark) => {
					if (bookmark.path === event.document.uri.fsPath) {
						if (bookmark.position.line > change.range.start.line) {
							bookmark.position
							return {
								...bookmark,
								position: new vscode.Position(bookmark.position.line + lineDelta, bookmark.position.character)
							};
						}
					}
					return bookmark;
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
				index: index,
				fileName: `${vscode.workspace.asRelativePath(textEditor.document.uri)}: ${currentPosition.line + 1}`,
				path: textEditor.document.uri.fsPath,
				position: { line: currentPosition.line, character: currentPosition.character }
			};

			let previousBookmark = bookmarks.find(x => x.index === index);

			if(previousBookmark) {
				const indexToDelete = bookmarks.findIndex(x => x.index === index);

				if(indexToDelete === -1) {
					return;
				}
		
				bookmarks.splice(indexToDelete, 1);
				removeBookmarkIcon(index);
				bookmarksProvider.removeBookmark(index);

				if(JSON.stringify(previousBookmark) === JSON.stringify(bookmark)) {
					return;
				}
			}

			bookmarks.push(bookmark);

			storeBookmarksGlobal();

			// Add to gutter
			addBookmarkIcon(index, context, new vscode.Position(bookmark.position.line, bookmark.position.character));

			// Add to ActivityBar
			bookmarksProvider.addBookmark(bookmark);
		});
	}
	
	function jumpBookmark(index: number) {
		return vscode.commands.registerCommand(`qbee.jumpBookmark${index}`, async () => {
			const bookmark = bookmarks.find(x => x.index === index);

			if (!bookmark) {
				return;
			}

			try {
				const document = await vscode.workspace.openTextDocument(vscode.Uri.file(bookmark.path));
				const textEditor = await vscode.window.showTextDocument(document);
				const position = new vscode.Position(bookmark.position.line, bookmark.position.character);
				const selection = new vscode.Selection(position, position);
				textEditor.selection = selection;
				textEditor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
		
			} catch (error) {
				vscode.window.showErrorMessage(`Error while jumping to bookmark ${index}`);
			}
		});
	}

	function removeBookmark(index: number) {
		return vscode.commands.registerCommand(`qbee.removeBookmark${index}`,  () => {
			const indexToDelete = bookmarks.findIndex(x => x.index === index);

			if(indexToDelete === -1) {
				return;
			}

        	bookmarks.splice(indexToDelete, 1);
			removeBookmarkIcon(index);
			bookmarksProvider.removeBookmark(index);
		});
	}

	function removeAllBookmarks() {
		return vscode.commands.registerCommand('qbee.removeAllBookmarks', () => {
			bookmarks = [];
			bookmarksProvider.removeAllBookmarksFromActivitybar();
			removeAllBookmarksFromGutter();
			
		});
	}
	
	function registerCommands(context: vscode.ExtensionContext) {
		for (let i = 1; i <= 5; i++) {
			context.subscriptions.push(
				registerBookmark(i, context),
				jumpBookmark(i),
				removeBookmark(i),
			);
		}

		context.subscriptions.push(removeAllBookmarks());
	}

    function restoreBookmarks() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
			return;
		}

        bookmarks.forEach((bookmark, index) => {
            if (bookmark && bookmark.path === editor.document.uri.fsPath) {
				const position = new vscode.Position(bookmark.position.line, bookmark.position.character);
                addBookmarkIcon(index, context, position);
            }
        });
    }

	function storeBookmarksGlobal() {
		context.globalState.update('qbee.bookmarks', bookmarks);
	}
}

export function deactivate() {}
