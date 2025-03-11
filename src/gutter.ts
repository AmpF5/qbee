import * as vscode from 'vscode';

const bookmarkDecorations = new Map<number, vscode.TextEditorDecorationType>();

export function addBookmarkIcon(index: number, context: vscode.ExtensionContext, position: vscode.Position) {
    let activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        return;
    }

    if (bookmarkDecorations.has(index)) {
        bookmarkDecorations.get(index)?.dispose();
        bookmarkDecorations.delete(index);
    }

    const decorationType = vscode.window.createTextEditorDecorationType({
        gutterIconPath: vscode.Uri.file(context.asAbsolutePath('media/icon.png')),
        gutterIconSize: 'contain',
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });

    const range = new vscode.Range(position, position);
    activeEditor.setDecorations(decorationType, [{ range }]);

    bookmarkDecorations.set(index, decorationType);
}

export function removeBookmarkIcon(index: number) {
    let activeEditor = vscode.window.activeTextEditor;
    
    if(!activeEditor) {
        return;
    }

    if (bookmarkDecorations.has(index)) {
        bookmarkDecorations.get(index)?.dispose();
        bookmarkDecorations.delete(index);
    }
}

export function removeAllBookmarksFromGutter() {
    bookmarkDecorations.clear();
}
