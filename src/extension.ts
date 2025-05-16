import * as vscode from 'vscode';


interface Command {
  title: string;
  script: string;
  description: string;
}

interface CommandItem extends vscode.QuickPickItem {
  command: Command;  // コマンド情報を保持するためのプロパティを追加
}

// 新たに追加する相対パスをフォーマットする関数
function formatRelativePath(uri: vscode.Uri, workspaceFolder: vscode.WorkspaceFolder | undefined): string | undefined {
  // URIからワークスペースに対する相対パスを計算
  const relativePath = vscode.workspace.asRelativePath(uri, false);

  // './' を付け加えてフォーマットする
  return `./${relativePath}`;
}

// 絶対パスをフォーマットする関数
function formatAbsolutePath(uri: vscode.Uri): string {
  return uri.fsPath;
}

// ドット区切りパスをフォーマットする関数
function formatDotSeparatedPath(uri: vscode.Uri, workspaceFolder: vscode.WorkspaceFolder | undefined): string | undefined {
  const relativePath = vscode.workspace.asRelativePath(uri, false);
  
  // フォルダーの場合は末尾の/を除去してからドット区切りに変換
  if (relativePath.endsWith('/')) {
    return relativePath.slice(0, -1).replace(/\//g, '.');
  }
  
  // ファイルの場合は拡張子を取り除いてからドット区切りに変換
  const lastDotIndex = relativePath.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // 拡張子がない場合はそのままドット区切りに変換
    return relativePath.replace(/\//g, '.');
  }
  const basePath = relativePath.substring(0, lastDotIndex);
  return basePath.replace(/\//g, '.');
}


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "contextpathcommander" is now active!');

  let disposable = vscode.commands.registerCommand('extension.showCommands', function (uri) {
      // ワークスペースのルートディレクトリを取得
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
      }

      // ファイルパスを取得（フォルダーの場合は末尾に/が付く）
      const filePath = formatRelativePath(uri, workspaceFolder);
      const absolutePath = formatAbsolutePath(uri);
      const dotSeparatedPath = formatDotSeparatedPath(uri, workspaceFolder);
  
      // パスが正しく取得できているか確認
      if (!filePath || !absolutePath || !dotSeparatedPath) {
        vscode.window.showErrorMessage('Failed to get path information.');
        return;
      }

      // 設定を読み込む
      const config = vscode.workspace.getConfiguration('contextPathCommander');
      const commands: Command[] = config.get('commands', []);

      // コマンドの重複をチェック
      const titleCount = new Map<string, number>();
      commands.forEach(cmd => {
        titleCount.set(cmd.title, (titleCount.get(cmd.title) || 0) + 1);
      });

      const items: CommandItem[] = commands.map(cmd => {
        const count = titleCount.get(cmd.title) || 0;
        const label = count > 1 
          ? `${cmd.title} (${cmd.description})`  // 重複がある場合は説明を表示
          : cmd.title;
        
        return {
          label: label,
          description: cmd.description,
          command: cmd  // コマンド情報を保持
        };
      });

      vscode.window.showQuickPick(
        items, {
          placeHolder: 'Select a command'
        }
      ).then(selection => {
        if (!selection) {
          return;
        }
        // 選択されたアイテムから直接コマンド情報を取得
        const selectedCommand = selection.command;
        if (selectedCommand) {
          console.log(`Run script: ${selectedCommand.script}`);
          const workspacePath = workspaceFolder.uri.fsPath;
          onCommandSelected(selectedCommand, filePath, absolutePath, dotSeparatedPath, workspacePath);
        }
      });
  });

  context.subscriptions.push(disposable);
}

function onCommandSelected(selectedCommand: Command, filePath: string, absolutePath: string, dotSeparatedPath: string, workspacePath: string) {
  executeCommand(selectedCommand.script, filePath, absolutePath, dotSeparatedPath, workspacePath);
}

function executeCommand(commandScript: string, filePath: string, absolutePath: string, dotSeparatedPath: string, workspacePath: string) {
  const commandToExecute = commandScript
    .replace('${relativePath}', filePath)          // 相対パスで置換
    .replace('${absolutePath}', absolutePath)      // 絶対パスで置換
    .replace('${dotSeparatedPath}', dotSeparatedPath); // ドット区切りパスで置換
    
  let terminal = vscode.window.terminals.find(t => t.name === "My Terminal"); // 既存のターミナルを探す
  if (!terminal) {
    terminal = vscode.window.createTerminal({ name: "My Terminal", cwd: workspacePath }); // 新規ターミナル作成
  }

  terminal.show();
  terminal.sendText(commandToExecute); // コマンドをターミナルに送信
}

export function deactivate() {}

module.exports = {
  activate,
  deactivate
};
