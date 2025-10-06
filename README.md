# @codebynithin/nithin-utils

<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/codebynithin/time-entry">
    <img src="./favicon.png" alt="Logo" width="80" height="80">
  </a>
</div>

A CLI utility toolkit for automating and managing build, deploy, and status operations for projects, AI code review, AI text refactor and related components.

## Features

- Build and deploy Gitlab project
- Check build and deployment status
- Utility functions for parameter parsing and object cleaning
- Extensible and scriptable for automation
- Create git branch
- AI Review merge request
- AI text refactoring

## Requirements

- Node.js >= 14.x
- npm >= 6.x
- A properly configured `.env.nu` file in your `~/Desktop` directory with required tokens and URLs:
  - `CSRF_TOKEN`
  - `COOKIE`
  - `ORIGIN`
  - `GITLAB_TOKEN`
  - `MR_PROMPT`
  - `MR_LANG`
  - `AI_API_KEY`
  - `AI_MODEL`

## Usage

You can use the CLI via the `nu` command:

```bash
nu <command> [options]
```

### Example Commands

- **Build:**
  ```bash
  nu build -project <project name> -components <component name> -instance <instance name>
  ```
- **Deploy:**
  ```bash
  nu deploy -project <project name> -components <component name> -instance <instance name>
  ```
- **Build & Deploy:**
  ```bash
  nu build-deploy -project <project name> -components <component name> -instance <instance name>
  ```
- **Create branch:**
  ```bash
  nu create-branch -task <task number> -type <feat|fix> -description <description> -repository <repository name>
  ```
- **Review:**
  ```bash
  nu review -project <project short name> -mergeId <merge id> -repository <repository name>
  ```
- **Refactor Text:**
  ```bash
  nu refactor <text>
  ```

### Command Reference

- `build` : Build specified components
- `deploy` : Deploy specified components
- `build-deploy` : Build and then deploy
- `version` : Show version info
- `help` : Show help
- `init` : Initialize configuration
- `create-branch` : Create git branch
- `review` : AI review specified merge request
- `refactor` : AI refactor specified text

### Options

- `-project` or `-p` : Project name (`portal`, `gateway`, `phr`)
- `-components` or `-c` : Components (`client`, `backend`, etc.)
- `-instance` or `-i` : Instance/environment (`dev`, `qa`, `pilot`)
- `-branch` or `-b` : Git branch (optional)
- `-task` or `-t` : Task number
- `-type` or `-ty` : Type (`feat`, `fix`)
- `-description` or `-d` : Description
- `-repository` or `-r` : Repository name
- `-mergeId` or `-mId` : Merge ID

## License

ISC

## Author

Nithin V (<mails2nithin@gmail.com>)
