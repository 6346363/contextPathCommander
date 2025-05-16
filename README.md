# Context Path Commander
"ContextPathCommander" is a VSCode extension that allows users to execute specific commands based on the file or folder path by right-clicking within the Explorer. Through a configuration file, users can customize the names of the commands displayed and the scripts that are executed. 

「Context Path Commander」は、VSCodeのエクスプローラー内でファイルやフォルダーを右クリックした際に、パスに基づいて特定のコマンドを実行することができる拡張機能です。
設定ファイルで、表示されるコマンドの名前や実行するスクリプトをカスタマイズできます。

## Usage Example

### Step 1: Configure Commands
Add your custom commands to the `settings.json` file. Refer to the "Extension Settings" section for details on how to configure the commands.

### Step 2: Right-Click on the Target File or Folder
Right-click on the target file or folder either in the File Explorer or in the open editor, and select "Context Path Commander" from the context menu.

![Context Menu](./images/readme_use_context.jpg)

### Step 3: Select Command from QuickPick
A QuickPick interface will appear at the top of the screen. From this list, select the command you wish to execute.

![QuickPick Interface](./images/readme_use_quickpick.jpg)

### Step 4: Command Execution
The selected command will be executed in the terminal, with the path placeholders (`${relativePath}`, `${absolutePath}`, `${dotSeparatedPath}`) replaced by the actual path of the file or folder.

## Extension Settings
List of commands that users can configure to appear in the QuickPick interface when triggered from either the context menu of the Explorer or an open editor. These commands can perform specific operations based on the selected path.

Use `${relativePath}`/`${absolutePath}`/`${dotSeparatedPath}` as a placeholder in the script where you want the path to be inserted:
- `${relativePath}` provides a path relative to the project's root, useful for project-specific scripts
- `${absolutePath}` indicates a full system path, ideal for cross-directory operations
- `${dotSeparatedPath}` formats paths with dots, crucial for referencing files in Python testing scripts (for folders, it will convert the path to dot notation without the trailing slash)

### Command Examples

#### File-specific commands
```json
{
  "title": "cat file",
  "script": "cat ${relativePath}",
  "description": "Show file content"
}
```

#### Folder-specific commands
```json
{
  "title": "list directory",
  "script": "ls -la ${absolutePath}",
  "description": "List directory contents"
}
```

#### Commands that work with both files and folders
```json
{
  "title": "get info",
  "script": "stat ${absolutePath}",
  "description": "Show file/folder information"
}
```

Note: Some commands may work differently or produce unexpected results depending on whether they are executed on a file or folder. It's recommended to test your commands with both file and folder targets to ensure they work as expected.

__Example:__
```json
[
  {
    "title": "cat command",
    "script": "cat ${relativePath}",
    "description": "Show File Content"
  },
  {
    "title": "cp command",
    "script": "cp ${absolutePath} ./backup/",
    "description": "Copy File",  
  },
  {    
    "title": "Python test command",
    "script": "python manage.py test ${dotSeparatedPath} --keepdb --parallel ",
    "description": "Python test",
  }
]
```

