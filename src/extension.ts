
import * as vscode from 'vscode';


interface Command {
  title: string;
  script: string;
  description: string;
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
  // 拡張子を取り除く
  const basePath: string = relativePath.substring(0, relativePath.lastIndexOf('.'));

  // '/'を'.'に置換する
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
      const filePath = formatRelativePath(uri, workspaceFolder);
      const absolutePath = formatAbsolutePath(uri);
      const dotSeparatedPath = formatDotSeparatedPath(uri, workspaceFolder);
  
      // ファイルパスが正しく取得できているか確認
      if (!filePath || !absolutePath || !dotSeparatedPath) {return; }

      // 設定を読み込む
      const config = vscode.workspace.getConfiguration('contextPathCommander');
      const commands: Command[] = config.get('commands', []);

      const items = commands.map(cmd => ({
        label: cmd.title,
        description: cmd.description,
      }));

      vscode.window.showQuickPick(
        items, {
          placeHolder: 'Select a command'
        }
      ).then(selection => {
        if (!selection) {
          return;
        }
        const selectedCommand = commands.find(cmd => cmd.title === selection.label);
        if (selectedCommand) {
          // 選択したコマンドのscriptを実行するなどの処理
          console.log(`Run script: ${selectedCommand.script}`);

          // ワークスペースのルートディレクトリのパスを取得
          const workspacePath = workspaceFolder.uri.fsPath;
          onCommandSelected(selection.label, commands, filePath, absolutePath, dotSeparatedPath, workspacePath);
        }
      });
    // });
  });

  context.subscriptions.push(disposable);
}

function onCommandSelected(selectedTitle: string, commands: Command[], filePath: string, absolutePath: string, dotSeparatedPath: string, workspacePath: string) {
  const selectedCommand = commands.find(cmd => cmd.title === selectedTitle);
  if (selectedCommand) {
      executeCommand(selectedCommand.script, filePath, absolutePath, dotSeparatedPath, workspacePath);
  }
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
