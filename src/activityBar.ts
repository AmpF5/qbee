import * as vscode from 'vscode';
import { Bookmark } from './extension';


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

    loadBookmarks(bookmarks: Bookmark[]): void {
        bookmarks.forEach(bookmark => {
            this.addBookmark(bookmark);
        });
    }
    
    addBookmark(bookmark: Bookmark): void {
      const newBookmark = new BookmarkItem(bookmark);
      this.bookmarks.push(newBookmark);
      this._onDidChangeTreeData.fire(undefined);
    }

    removeBookmark(index: number): void {
        const indexToDelete = this.bookmarks.findIndex(x => x.index === index);
        if(indexToDelete !== -1) {
            this.bookmarks.splice(indexToDelete, 1);
        }
    }
  }
  
  class BookmarkItem extends vscode.TreeItem {
        public readonly index: number;
        public readonly label: string;
        public readonly position: vscode.Position;

        constructor(bookmark: Bookmark) {
            super(bookmark.fileName, vscode.TreeItemCollapsibleState.None);
            this.index = bookmark.index;
            this.label = bookmark.fileName;
            this.position = new vscode.Position(bookmark.position.line, bookmark.position.character);
            this.command = {
                command: `qbee.jumpBookmark${bookmark.index}`,
                title: `Go to Bookmark ${bookmark.index}`,
                arguments: [this.position]
            };
        }
  }