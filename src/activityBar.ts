import * as vscode from 'vscode';


export class BookmarksProvider implements vscode.TreeDataProvider<BookmarkItem> {
    private bookmarks: BookmarkItem[] = [];
    private _onDidChangeTreeData: vscode.EventEmitter<BookmarkItem | undefined> = new vscode.EventEmitter<BookmarkItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<BookmarkItem | undefined> = this._onDidChangeTreeData.event;
  
    getTreeItem(element: BookmarkItem): vscode.TreeItem {
      return element;
    }
  
    getChildren(): BookmarkItem[] {
      return this.bookmarks;
    }
    
    addBookmark(index: number, label: string, position: vscode.Position): void {
      const newBookmark = new BookmarkItem(index, label, position);
      this.bookmarks.push(newBookmark);
      this._onDidChangeTreeData.fire(undefined);
    }
  }
  
  class BookmarkItem extends vscode.TreeItem {
    constructor(
        public readonly index: number,
        public readonly label: string,
        public readonly position: vscode.Position
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: `qbee.jumpBookmark${index}`,
            title: `Go to Bookmark ${index}`,
            arguments: [this.position]
        };
    }
  }