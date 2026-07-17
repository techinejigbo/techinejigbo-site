# Tech in Ejigbo

A monorepo for the TechinEjigbo platform. This repository contains the Next.js applications and shared packages that power the platform.

## Architecture

This project is structured as an npm workspaces monorepo.

### Applications (`apps/`)

*   **`admin-app`**: The administrative dashboard for managing the platform. Built with Next.js 15, React 19, and Tailwind CSS v4.
*   **`public-site`**: The main public-facing website. Built with Next.js 16, React 19, and Tailwind CSS v4.
*   **`student-portal`**: The dedicated portal for students. Built with Next.js 15, React 19, Tailwind CSS v4, and Motion for animations.

### Packages (`packages/`)

*   **`firebase`** (`@techinejigbo/firebase`): Shared Firebase configuration and utility functions used across multiple apps.
*   **`ui`**: Shared UI components and design system for consistent styling across the platform.

## Getting Started

### Prerequisites

*   Node.js (v20 or higher recommended)
*   npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd techinejigbo-site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Variables:
   * Copy the `.env.example` file to `.env` or `.env.local` and fill in the necessary Firebase credentials and other environment variables.

### Development

To start the development servers for all applications simultaneously:

```bash
npm run dev
```

To start a specific application, use the workspace flag:
```bash
npm run dev --workspace=admin-app
npm run dev --workspace=public-site
npm run dev --workspace=student-portal
```

### Building for Production

To build all applications:
```bash
npm run build
```

To build a specific application:
```bash
npm run build --workspace=admin-app
```

## Technologies Used

*   **Framework**: [Next.js](https://nextjs.org/)
*   **UI Library**: [React 19](https://react.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Backend as a Service**: [Firebase](https://firebase.google.com/)
*   **Animations**: [Motion](https://motion.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Package Management**: npm workspaces
