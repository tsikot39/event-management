# GitHub Copilot Instructions for Event Management Platform

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js Event Management & Ticketing Platform built with:
- **Next.js 15** with App Router and TypeScript
- **MongoDB** with Mongoose for data persistence
- **Shadcn UI** for components and styling
- **NextAuth.js** for authentication
- **Tailwind CSS** for styling
- **Zod** for validation
- **React Hook Form** for form management

## Architecture Guidelines

### Authentication
- Use NextAuth.js with JWT strategy
- Implement role-based access control (Organizer/Attendee)
- Protect routes using middleware and server components
- Store user sessions securely with httpOnly cookies

### Database Design
- Use MongoDB with Mongoose ODM
- Implement proper indexing for performance
- Use atomic operations for ticket purchases
- Design schemas for: Users, Events, Tickets, Purchases

### Code Organization
- Follow Next.js App Router patterns
- Use Server Components for data fetching
- Use Client Components for interactivity
- Implement proper error boundaries
- Use TypeScript for type safety

### UI/UX Standards
- Use Shadcn UI components exclusively
- Implement responsive design with Tailwind CSS
- Follow accessibility best practices
- Provide loading states and error handling
- Use proper semantic HTML

### Security Best Practices
- Validate all inputs with Zod
- Sanitize user data
- Implement CORS properly
- Use environment variables for secrets
- Implement rate limiting

### Performance Optimization
- Optimize images with next/image
- Use proper caching strategies
- Implement pagination for large datasets
- Use React Query for server state management
- Minimize bundle size

## File Structure Guidelines
```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database utilities
│   └── validations/      # Zod schemas
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## Coding Standards
- Use TypeScript for all files
- Implement proper error handling
- Write clear, self-documenting code
- Use consistent naming conventions
- Add JSDoc comments for complex functions
- Follow React best practices (hooks, memo, etc.)

## Testing Guidelines
- Write unit tests for utilities
- Test form validations
- Test authentication flows
- Test API endpoints
- Use proper mocking for external services
