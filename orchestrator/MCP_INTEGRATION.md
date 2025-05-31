# MCP Integration Guide

The MAHA Orchestrator now supports Model Context Protocol (MCP) servers alongside traditional HTTP agents. This allows you to integrate any MCP-compliant server into your workflows seamlessly.

## Quick Start

1. **Create MCP Configuration**: Create an `mcp.json` file in your project root
2. **Configure MCP Servers**: Add your MCP server configurations
3. **Start Orchestrator**: The orchestrator will automatically start and manage MCP servers
4. **Create Workflows**: Use MCP servers just like any other agent in workflows

## Configuration

### File-based Configuration

Create an `mcp.json` file in one of these locations:

- `./mcp.json` (project root)
- `./orchestrator/mcp.json`
- `./config/mcp.json`

Example configuration:

```json
{
  "mcpServers": {
    "akave": {
      "command": "npx",
      "args": ["-y", "akave-mcp-js"],
      "env": {
        "AKAVE_ACCESS_KEY_ID": "your_access_key",
        "AKAVE_SECRET_ACCESS_KEY": "your_secret_key",
        "AKAVE_ENDPOINT_URL": "https://o3-rc1.akave.xyz"
      }
    },
    "github-mcp": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_github_token"
      }
    },
    "filesystem-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/directory"
      ],
      "timeout": 30000
    }
  }
}
```

### Environment Variable Configuration

You can also provide the configuration via environment variable:

```bash
export MCP_CONFIG='{"mcpServers":{"akave":{"command":"npx","args":["-y","akave-mcp-js"],"env":{"AKAVE_ACCESS_KEY_ID":"your_key"}}}}'
```

## MCP Server Configuration Format

Each MCP server entry supports these fields:

- **command** (required): The shell command to launch the MCP server
- **args** (optional): Array of command-line arguments
- **env** (optional): Object containing environment variables
- **timeout** (optional): Timeout in milliseconds (default: 60000)

## Supported MCP Servers

The orchestrator supports any MCP-compliant server. Some popular examples:

### File System Access

```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"]
}
```

### GitHub Integration

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_TOKEN": "your_token"
  }
}
```

### Web Fetch

```json
"fetch": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-fetch"]
}
```

### SQLite Database

```json
"sqlite": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "/path/to/database.db"]
}
```

## API Endpoints

### Get MCP Server Status

```
GET /mcp/servers
```

Response:

```json
{
  "success": true,
  "servers": {
    "akave": {
      "name": "akave",
      "status": "running",
      "startedAt": 1642684800000
    }
  }
}
```

### Refresh MCP Agents

```
POST /mcp/refresh
```

Forces a refresh of MCP agent capabilities.

### Get Sample Configuration

```
GET /mcp/config/sample
```

Returns a sample MCP configuration with popular servers.

## Using MCP Servers in Workflows

Once configured, MCP servers appear as regular agents in the orchestrator:

### Discovery

```
GET /agents
```

Returns both HTTP and MCP agents:

```json
{
  "agents": [
    {
      "type": "http",
      "name": "Hello World Agent",
      "url": "http://localhost:3001"
    },
    {
      "type": "mcp",
      "name": "akave",
      "serverName": "akave",
      "tools": [...],
      "resources": [...]
    }
  ]
}
```

### Workflow Creation

MCP servers are automatically included in workflow planning:

```bash
POST /workflows/create
{
  "prompt": "Store a file using Akave and then fetch it back"
}
```

### Direct Execution

You can also execute MCP servers directly:

```bash
POST /execute
{
  "agentUrl": "mcp://akave",
  "input": {
    "tool": "store_file",
    "args": {
      "filename": "test.txt",
      "content": "Hello World"
    }
  }
}
```

## Workflow Integration Examples

### Simple File Storage

```json
{
  "prompt": "Save 'Hello World' to a file named test.txt using Akave"
}
```

### GitHub + File System Workflow

```json
{
  "prompt": "Read the README.md file and create a GitHub issue summarizing it"
}
```

### Data Processing Pipeline

```json
{
  "prompt": "Fetch data from an API, save it to a file, and create a GitHub commit"
}
```

## Error Handling

The orchestrator provides comprehensive error handling for MCP servers:

- **Startup Errors**: Logged and server marked as "error" status
- **Communication Errors**: Graceful fallback and retry logic
- **Timeout Handling**: Configurable timeouts per server
- **Process Management**: Automatic cleanup on shutdown

## Best Practices

1. **Environment Variables**: Use environment variables for sensitive data
2. **Timeout Configuration**: Set appropriate timeouts based on server performance
3. **Resource Management**: Monitor server resource usage
4. **Error Monitoring**: Check `/mcp/servers` endpoint for server health
5. **Configuration Management**: Use version control for MCP configurations

## Troubleshooting

### Server Won't Start

- Check command and args are correct
- Verify environment variables are set
- Check server logs in orchestrator output

### Agent Not Discovered

- Use `POST /mcp/refresh` to refresh agents
- Check server status with `GET /mcp/servers`
- Verify MCP server implements required protocol methods

### Workflow Execution Fails

- Check agent input/output schemas
- Verify tool names and arguments
- Review execution logs for detailed errors

## Security Considerations

- **Environment Variables**: Never commit secrets to version control
- **File System Access**: Limit filesystem server access to specific directories
- **Network Access**: Configure fetch servers with appropriate restrictions
- **Process Isolation**: MCP servers run as separate processes for isolation

## Migration from HTTP Agents

MCP servers complement rather than replace HTTP agents. Both can coexist in the same orchestrator instance. To migrate:

1. Keep existing HTTP agent configurations
2. Add MCP server configurations to `mcp.json`
3. Update workflows to use new MCP capabilities
4. Gradually transition workflows as needed

The orchestrator automatically handles both agent types transparently in workflows.
