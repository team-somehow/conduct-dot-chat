# MAHA HTTP Orchestrator Implementation

## Overview

This is a complete implementation of the HTTP-based orchestrator design that treats every AI agent as a REST microservice. The implementation provides a drop-in replacement for file-based orchestration while maintaining the same on-chain flow (stake → escrow → slice → rate).

## ✅ Implementation Status

### Core Components Implemented

- **✅ HTTP Agent Discovery** (`src/agents.http.ts`)

  - Agent metadata fetching from `/meta` endpoint
  - JSON schema validation with AJV
  - Runtime agent loading and caching

- **✅ Agent Execution** (`src/agents.http.ts`)

  - Schema-validated input/output
  - HTTP POST to `/run` endpoint
  - Error handling and timeout management

- **✅ Blockchain Integration** (`src/Contract.ts`)

  - Viem-based contract interactions
  - Type-safe contract calls
  - Support for AgentStore and TaskHub contracts

- **✅ Job Orchestration** (`src/JobRunner.ts`)

  - Sequential and parallel task execution
  - Payment distribution
  - Job lifecycle management
  - Rating and completion handling

- **✅ Configuration Management** (`src/config.ts`)

  - Environment variable handling
  - Agent endpoint configuration
  - Hot-swappable agent lists

- **✅ CLI Interface** (`src/server.ts`)
  - Multiple execution modes (sync, demo, advanced, health)
  - Graceful error handling
  - Comprehensive logging

### Additional Features

- **✅ TypeScript Support**

  - Full type safety
  - Proper interface definitions
  - Compile-time error checking

- **✅ Example Agent** (`examples/sample-agent.js`)

  - Complete reference implementation
  - Demonstrates HTTP contract compliance
  - Ready-to-deploy example

- **✅ Testing Infrastructure**

  - Local testing with mock agents
  - Build verification
  - Health check utilities

- **✅ Documentation**
  - Comprehensive README
  - API documentation
  - Deployment guides

## 🏗️ Architecture

```
┌─────────────────┐    HTTP    ┌─────────────────┐
│   Orchestrator  │ ◄────────► │   AI Agent 1    │
│                 │            │  (DALL-E 3)     │
│  ┌───────────┐  │            └─────────────────┘
│  │JobRunner  │  │
│  └───────────┘  │    HTTP    ┌─────────────────┐
│                 │ ◄────────► │   AI Agent 2    │
│  ┌───────────┐  │            │ (Watermarker)   │
│  │Contract   │  │            └─────────────────┘
│  └───────────┘  │
│                 │ Blockchain ┌─────────────────┐
│                 │ ◄────────► │  Smart Contracts│
└─────────────────┘            │ AgentStore +    │
                               │ TaskHub         │
                               └─────────────────┘
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd orchestrator
npm install
cp .env.example .env
# Edit .env with your configuration
```

### 2. Configure Agents

Edit `src/config.ts`:

```typescript
export const AGENT_ENDPOINTS = [
  "https://your-dalle-agent.com",
  "https://your-watermark-agent.com",
];
```

### 3. Run the Orchestrator

```bash
# Test local functionality
npm run test:local

# Sync agents with blockchain
npm run dev sync

# Run demo job
npm run dev demo

# Check agent health
npm run dev health
```

## 📋 Agent Contract Specification

Every compliant agent must implement:

### GET `/meta`

```json
{
  "name": "Agent Name",
  "description": "Agent description",
  "wallet": "0x...",
  "inputSchema": {
    /* JSON Schema */
  },
  "outputSchema": {
    /* JSON Schema */
  },
  "previewURI": "ipfs://..."
}
```

### POST `/run`

- **Input**: JSON matching `inputSchema`
- **Output**: JSON matching `outputSchema`
- **Validation**: Both input and output are validated

## 🔧 Key Features

### Schema Validation

- **AJV-powered**: Compile-time schema compilation
- **Input validation**: Prevents invalid requests
- **Output validation**: Ensures response compliance
- **Error reporting**: Clear validation error messages

### Hot-Swappable Agents

- **Configuration-based**: Add/remove agents via config
- **No code changes**: Runtime agent discovery
- **Health monitoring**: Automatic agent health checks
- **Fallback handling**: Graceful degradation

### Blockchain Integration

- **Type-safe contracts**: Viem-based interactions
- **Gas optimization**: Efficient transaction batching
- **Error handling**: Comprehensive blockchain error management
- **Multi-network**: Support for different chains

### Job Orchestration

- **Sequential execution**: Chain agent outputs
- **Parallel execution**: Run agents concurrently
- **Payment distribution**: Automatic agent payments
- **Rating system**: 5-star agent rating
- **Job tracking**: Complete execution history

## 🧪 Testing

### Local Testing

```bash
npm run test:local
```

This runs a complete test with mock agents to verify:

- Agent discovery
- Schema validation
- Job execution
- Error handling

### Health Checks

```bash
npm run dev health
```

Checks all configured agents for:

- Endpoint availability
- Metadata compliance
- Response times

## 🚀 Deployment

### Agent Deployment

Deploy agents to any HTTPS platform:

- **Vercel**: `vercel deploy`
- **Fly.io**: `fly deploy`
- **Railway**: `railway deploy`
- **AWS Lambda**: Serverless deployment
- **Google Cloud**: Cloud Functions

### Orchestrator Deployment

```bash
npm run build
# Deploy dist/ folder to your platform
# Set environment variables
```

## 🔒 Security Considerations

- **Private key management**: Use secure key storage
- **HTTPS enforcement**: All agent communication over HTTPS
- **Input validation**: Comprehensive schema validation
- **Rate limiting**: Implement agent-side rate limiting
- **Error handling**: No sensitive data in error messages

## 📊 Monitoring

Built-in monitoring features:

- **Health checks**: Regular agent availability checks
- **Performance metrics**: Response time tracking
- **Error logging**: Comprehensive error reporting
- **Job tracking**: Complete execution audit trail

## 🔄 Migration from File-Based

To migrate from file-based orchestration:

1. **Deploy agents**: Convert file-based agents to HTTP services
2. **Update config**: Replace file paths with HTTP endpoints
3. **Test locally**: Use `npm run test:local`
4. **Deploy**: No changes to smart contracts needed

## 🎯 Benefits Achieved

✅ **Hackathon-friendly**: Quick deployment on free platforms  
✅ **No file I/O**: Pure HTTP-based communication  
✅ **Schema-safe**: Compile-time and runtime validation  
✅ **Hot-swappable**: Dynamic agent configuration  
✅ **Modular**: Unchanged on-chain components  
✅ **Type-safe**: Full TypeScript support  
✅ **Production-ready**: Comprehensive error handling

## 🛠️ Development

### Adding New Agents

1. Implement HTTP contract (`/meta` and `/run`)
2. Add endpoint to `src/config.ts`
3. Test with `npm run dev health`
4. Deploy and sync with `npm run dev sync`

### Extending Functionality

- **Custom job types**: Extend `JobRunner` class
- **New payment models**: Modify payment distribution
- **Additional validation**: Extend schema validation
- **Monitoring**: Add custom metrics

## 📝 Next Steps

Potential enhancements:

- **Agent marketplace**: Dynamic agent discovery
- **Load balancing**: Multiple instances per agent type
- **Caching**: Response caching for expensive operations
- **Streaming**: Support for streaming responses
- **Webhooks**: Async job completion notifications

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

The implementation is complete and ready for production use! 🎉
