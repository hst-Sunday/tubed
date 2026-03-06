# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 特别注意
1.不要运行 npm run dev 命令，不需要你检查是否能运行

## Project Overview

This is "Tubed" - a cyberpunk-themed image hosting service built with Next.js 15 and React 19. The application features a futuristic design with neon effects, drag-and-drop upload, paste upload functionality, and immediate sharing capabilities. The UI is heavily styled with custom CSS animations and cyberpunk aesthetics.

## Development Commands

- `npm run dev` - Start development server with Turbopack (opens on http://localhost:3001)
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture & Key Components

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with better-sqlite3 for metadata storage
- **Authentication**: JWT-based auth with httpOnly cookies
- **UI Components**: shadcn/ui with custom cyberpunk styling
- **Styling**: Tailwind CSS v4 with custom CSS variables and animations
- **Icons**: Lucide React
- **Utilities**: clsx, class-variance-authority, tailwind-merge, jsonwebtoken, better-sqlite3

### Core Components
- `components/upload-zone.tsx` - Main file upload component with drag/drop and paste functionality
- `components/auth-guard.tsx` - Route protection wrapper for authenticated access
- `components/file-card.tsx` - File display component with preview, selection, and operations
- `components/ui/` - shadcn/ui component library (button, card, badge, dialog, pagination, checkbox)
- `app/page.tsx` - Homepage with cyberpunk design (protected by AuthGuard)
- `app/login/page.tsx` - Cyberpunk-styled login page for AUTH_CODE verification
- `app/dashboard/page.tsx` - File management dashboard with batch operations
- `lib/auth.ts` - Authentication utilities and useAuth hook
- `lib/utils.ts` - Utility functions including `cn()` for class merging
- `lib/database.ts` - SQLite database operations and file metadata management
- `lib/file-types.ts` - File type definitions, validation, and categorization system
- `lib/migrate.ts` - Data migration utilities (JSON to SQLite)

### Styling System
- Uses Tailwind CSS v4 with custom CSS variables defined in `app/globals.css`
- Cyberpunk theme with neon effects, holographic elements, and animations
- Custom CSS classes like `.neon-glow`, `.holographic`, `.float`, `.glitch`
- Extended neon glow variants: `.neon-glow-blue`, `.neon-glow-green`, `.neon-glow-purple`, `.neon-glow-yellow`, `.neon-glow-red`, `.neon-glow-cyan`
- Color scheme uses OKLCH color space for vibrant cyberpunk aesthetics
- Chinese language UI text throughout the application

### File Upload & Management System

#### Supported File Types
- **Images**: jpg, jpeg, png, gif, webp, svg, bmp, ico (10MB limit)
- **Documents**: doc, docx, txt, rtf, odt (50MB limit) 
- **PDF**: pdf files (50MB limit)
- **Spreadsheets**: xls, xlsx, csv, ods (50MB limit)
- **Videos**: mp4, avi, mov, wmv, flv, webm, mkv (500MB limit)
- **Audio**: mp3, wav, flac, aac, ogg, wma (100MB limit)
- **Archives**: zip, rar, 7z, tar, gz, bz2 (200MB limit)
- **Code**: js, ts, html, css, json, py, java, cpp, c, php (10MB limit)

#### Upload Flow
1. **File Validation**: Type checking, size limits, and security validation
2. **Drag & Drop**: Full drag and drop support with visual feedback
3. **Clipboard Upload**: Ctrl+V paste support for files and images
4. **Server Processing**: Files saved to `/public/uploads/` with unique names
5. **Database Storage**: Metadata stored in SQLite with full indexing
6. **Error Handling**: Automatic cleanup on upload failure

#### File Management Features
- **Smart Categorization**: Automatic file type detection and categorization
- **Multiple Share Formats**: URL, Markdown, and HTML copy options optimized per file type
- **File Preview**: Icons and thumbnails based on file categories
- **Image Preview**: Click-to-enlarge lightbox with high-quality image display
- **Search & Filter**: Full-text search and category-based filtering
- **Statistics**: Real-time file count, size, and category analytics
- **Batch Operations**: Multi-select and batch delete functionality
- **Keyboard Shortcuts**: Ctrl+A (select all), ESC (exit selection), Delete (batch delete)

## Configuration Notes

- **TypeScript**: Configured with strict mode and Next.js plugin
- **ESLint**: Uses Next.js core-web-vitals and TypeScript presets
- **Path Aliases**: `@/*` maps to project root for imports
- **shadcn/ui**: Configured with New York style, CSS variables, and Lucide icons
- **Next.js Images**: Configured for local uploads with optimization and lazy loading
- **Toast Notifications**: Using sonner library for user feedback

## Authentication System

### Security Model
- **Server-side validation**: AUTH_CODE verification happens in API routes, not client-side
- **JWT tokens**: Secure authentication using JSON Web Tokens with 24-hour expiration
- **HttpOnly cookies**: Tokens stored securely, inaccessible to client-side JavaScript
- **Route protection**: All pages protected by AuthGuard component

### API Routes

#### Authentication
- `POST /api/auth/login` - Verify AUTH_CODE and issue JWT token
- `GET /api/auth/verify` - Validate existing JWT token
- `POST /api/auth/logout` - Clear authentication cookie

#### File Operations
- `POST /api/upload` - Upload multiple files with validation and database storage
- `GET /api/files` - Get file list with pagination, search, and filtering
  - Query params: `page`, `limit`, `category`, `sortBy`, `sortOrder`, `search`, `stats`
- `GET /api/files/[id]` - Get specific file metadata by ID
- `DELETE /api/files/[id]` - Delete file (both database record and physical file)
- `POST /api/files/batch-delete` - Batch delete multiple files with transaction support

### Environment Variables
- `AUTH_CODE` - Secret code for authentication (set in .env)
- `JWT_SECRET` - Secret key for JWT signing (change in production)

### Authentication Flow
1. User visits any page → redirected to `/login` if not authenticated
2. Enter AUTH_CODE → server validates and issues JWT token
3. Token stored in httpOnly cookie, valid for 24 hours
4. AuthGuard verifies token on each page load via `/api/auth/verify`

## Database Architecture

### SQLite Database (`data/tubed.db`)
- **Performance**: WAL mode enabled for better concurrent access
- **Indexing**: Optimized indexes on category, uploadedAt, type, size for fast queries
- **Schema**: Single `files` table with complete metadata storage
- **Migration**: Automatic migration from legacy `uploads-metadata.json` format
- **Backup**: Database file can be easily backed up and restored

### Key Database Operations (`lib/database.ts`)
- `insertFile(file)` - Add new file record with transaction safety
- `getFiles(options)` - Paginated file listing with sorting and filtering
- `searchFiles(query, options)` - Full-text search across file names
- `getFileStats()` - Real-time statistics (total files, size, category breakdown)
- `deleteFile(id)` - Remove file record with optional physical file cleanup

## Development Notes

- **Authentication required**: All routes except `/login` require valid AUTH_CODE
- **File uploads**: Full server-side processing with database persistence
- **UI Language**: Heavy use of Chinese text for UI labels and descriptions
- **Styling**: Extensive custom CSS animations for cyberpunk aesthetic
- **Architecture**: Component structure follows shadcn/ui patterns with custom styling overrides
- **Security**: Never expose AUTH_CODE in client-side code or environment variables
- **Database**: SQLite provides zero-config persistence with enterprise-grade reliability
- **File Safety**: Upload failures automatically clean up partial files and database entries

## Dashboard & File Management

### Dashboard Features (`/dashboard`)
- **Grid Layout**: Responsive card-based file display (5 cards per row on desktop)
- **Pagination**: 15 files per page with shadcn/ui pagination component
- **Real-time Statistics**: File count, total size, category breakdown, current page info
- **Search & Filter**: File name search and category filtering with sorting options
- **Batch Operations**: Multi-select mode with batch delete functionality

### File Card Component (`components/file-card.tsx`)
- **Image Preview**: Actual image previews for image files, icons for other types
- **Click-to-Enlarge**: Lightbox modal for full-size image viewing with Next.js Image optimization
- **Selection Mode**: Checkbox-based multi-selection with visual feedback (cyan border/background)
- **Hover Effects**: Cyberpunk-styled overlay with file name and zoom indicator
- **Operation Buttons**: View, delete, and other file operations

### Batch Operations
- **Selection Controls**: Toggle selection mode, select all, clear selection
- **Keyboard Shortcuts**: 
  - `Ctrl+A`: Select all files in current page
  - `ESC`: Exit selection mode
  - `Delete`: Open batch delete confirmation
- **Batch Delete**: Transactional deletion with detailed success/failure reporting
- **Visual Feedback**: Selected files show cyan glow, operation progress indicators

### Image Lightbox
- **Full-Screen Display**: Modal with optimized image loading (90% quality, priority loading)
- **Responsive Sizing**: Auto-fit to 90% of viewport while maintaining aspect ratio
- **Navigation**: ESC key or click outside to close, body scroll prevention
- **File Info**: Overlay with filename, size, and upload date
- **Accessibility**: Proper ARIA labels and screen reader support

### UI/UX Enhancements
- **Responsive Design**: Mobile-first grid layout (1-2-3-4-5 columns based on screen size)
- **Loading States**: Spinners for file loading, image loading, and batch operations
- **Error Handling**: Graceful fallbacks for failed image loads
- **Toast Notifications**: Success/error messages for all operations
- **Cyberpunk Theme**: Consistent neon effects, animations, and color scheme