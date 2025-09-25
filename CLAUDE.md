# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an enterprise-grade RAG (Retrieval Augmented Generation) pipeline web application built with Next.js 15. The project is designed for air-gapped environments with collection-based document separation, API key management, and real-time monitoring capabilities.

## Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Planned Backend**: FastAPI + SQLAlchemy + Alembic
- **Planned Database**: SQLite (metadata) + Milvus (vector storage) + Redis (caching)
- **Planned AI**: OpenAI API (text-embedding-3-small)

## Essential Commands

### Development
```bash
npm run dev          # Start development server with Turbo
npm run build        # Build for production with Turbo
npm start            # Start production server
npm run lint         # Run ESLint
```

## Project Structure and Configuration

### Key Configuration Files
- `components.json`: shadcn/ui configuration with "new-york" style, Lucide icons, and path aliases
- `tsconfig.json`: TypeScript configuration with path mapping (`@/*` -> `./`)
- `tailwind.config.js`: Tailwind CSS v4 configuration
- `next.config.ts`: Next.js configuration (currently minimal)

### Important Path Aliases
- `@/components` -> `./components`
- `@/lib` -> `./lib`
- `@/lib/utils` -> `./lib/utils`
- `@/components/ui` -> `./components/ui`
- `@/hooks` -> `./hooks`

### Current Architecture
The project is currently in early setup phase with:
- Basic Next.js App Router structure (`app/` directory)
- shadcn/ui utilities setup in `lib/utils.ts`
- Tailwind CSS with custom styling
- Planning documents in `prompts/` directory

### Project Planning
The `prompts/` directory contains detailed planning documents for the full RAG system implementation:
- `all_plan.md`: Comprehensive system architecture and implementation plan
- Individual planning files for UI components, database, API, testing, and integration

## Architecture Goals (From Planning)

The application will feature:
1. **Modal-based UI**: Single-level sidebar with modal interactions
2. **Collection Management**: Document separation by collections
3. **Real-time Monitoring**: System health and synchronization status
4. **API Key Management**: Role-based access control with usage tracking
5. **Advanced RAG Features**: Hybrid search, context expansion, caching strategies

## Important Development Guidelines

### Critical Rules
1. **No Emojis**: Never use emojis in code, comments, or any development artifacts
2. **UI Components**: Always use shadcn/ui MCP tool when creating or modifying UI components
3. **Complex Tasks**: Use sequential thinking MCP tool for difficult or multi-step implementation tasks
4. **Color Themes**: Never hardcode colors - always use CSS variables and Tailwind theme system

### MCP Tool Usage
- `shadcn/ui MCP`: For all component creation and UI development
- `sequential thinking MCP`: For complex problem-solving and implementation planning

## Development Notes

- Uses Turbo for faster builds and development
- Configured for shadcn/ui component system
- TypeScript strict mode enabled
- Path aliases configured for cleaner imports
- Project is currently in initial setup phase - most backend functionality is planned but not yet implemented