import * as vscode from 'vscode';

export function addBookmarkIcon(context: vscode.ExtensionContext, position: vscode.Position) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        gutterIconPath: vscode.Uri.file(context.asAbsolutePath('media/icon.png')),
        gutterIconSize: 'contain',
    });

    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const range = new vscode.Range(position.line, 0, position.line, 0);
        activeEditor.setDecorations(decorationType, [{ range }]);
    }
}