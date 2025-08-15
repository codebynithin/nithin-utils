# @codebynithin/nithin-utils

A CLI utility toolkit for automating and managing build, deploy, and status operations for Medica projects (portal, gateway, phr) and related components.

## Features

- Build and deploy project components (client/backend)
- Check build and deployment status
- Environment configuration via `.env.nu`
- Utility functions for parameter parsing and object cleaning
- Extensible and scriptable for automation
- Create git branch

## Requirements

- Node.js >= 14.x
- npm >= 6.x
- A properly configured `.env.nu` file in your `~/Desktop` directory with required tokens and URLs:
  - `CSRF_TOKEN`
  - `COOKIE`
  - `ORIGIN`

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
  nu create-branch -task <task number> -type <feat|fix> -description <description> -project <project short name>
  ```

### Command Reference

- `build` : Build specified components
- `deploy` : Deploy specified components
- `build-deploy` : Build and then deploy
- `version` : Show version info
- `help` : Show help
- `init` : Initialize configuration
- `create-branch` : Create git branch

### Options

- `-project` or `-p` : Project name (`portal`, `gateway`, `phr`)
- `-components` or `-c` : Components (`client`, `backend`, etc.)
- `-instance` or `-i` : Instance/environment (`dev`, `qa`, `pilot`)
- `-branch` or `-b` : Git branch (optional)
- `-task` or `-t` : Task number
- `-type` or `-y` : Type (`feat`, `fix`)
- `-description` or `-d` : Description

## License

ISC

## Author

Nithin V (<mails2nithin@gmail.com>)
