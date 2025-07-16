# EventHub - Event Management & Ticketing Platform

A comprehensive Next.js-based event management and ticketing platform that allows organizers to create and manage events while providing attendees with an intuitive way to discover and purchase tickets.

## 🎯 **What This App Does**

**EventHub** is a full-stack web application that bridges the gap between event organizers and attendees:

### **For Event Organizers:**
- Create and publish events with rich details (descriptions, dates, locations, pricing)
- Manage multiple ticket types with different pricing tiers
- Track real-time sales analytics and attendee metrics
- Monitor event performance through comprehensive dashboards

### **For Attendees:**
- Discover events through advanced search and filtering
- Purchase tickets with a seamless checkout experience
- Manage purchased tickets with digital confirmation codes
- View event details, dates, and location information

### **Key Capabilities:**
- **Real-time Attendee Tracking**: Dynamic count updates based on actual ticket sales
- **Payment Simulation**: Realistic payment flow with card form validation
- **Role-based Access**: Separate experiences for organizers vs attendees
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🎉 **IMPLEMENTATION STATUS: COMPLETE CORE FEATURES**

### ✅ **Fully Implemented Features**

#### 🔐 **Authentication System**

- **Login/Register Pages**: Complete forms with validation (`/auth/login`, `/auth/register`)
- **NextAuth.js Integration**: Email/password credentials provider (GitHub OAuth removed)
- **Role-based Access**: Organizer vs Attendee roles with proper middleware
- **Protected Routes**: Automatic redirects and authorization checks
- **Consistent Navigation**: Sticky navbar with hideAuth prop for auth pages

#### 🎪 **Event Management**

- **Event Creation**: Full-featured form for organizers (`/events/create`)
- **Event Details**: Rich event pages with ticket purchasing (`/events/[slug]`)
- **Event Listings**: Browse events with filtering and search
- **Categories**: Organized event categorization system

#### 🎫 **Ticket System**

- **Ticket Purchase**: Modal-based purchasing with validation
- **Payment Simulation**: Realistic payment modal with card form validation
- **My Tickets**: User dashboard to view purchased tickets (`/my-tickets`)
- **Confirmation Codes**: Unique ticket identifiers
- **Real-time Attendee Counts**: Dynamic calculation from actual ticket purchases
- **Proper Date Handling**: Fixed date serialization and display formatting

#### 👨‍💼 **Organizer Dashboard**

- **Event Management**: Create, view, and track events (`/dashboard`)
- **Analytics**: Revenue, ticket sales, and attendance metrics
- **Event Status**: Past, upcoming, and live event tracking

#### 🛡️ **Security & Validation**

- **Input Validation**: Zod schemas for all forms
- **Route Protection**: Middleware-based authentication
- **API Security**: Protected endpoints with session validation
- **Type Safety**: Full TypeScript implementation

#### 🎨 **UI/UX**

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Shadcn UI component library
- **Loading States**: Proper feedback for all async operations
- **Error Handling**: User-friendly error messages
- **Image Optimization**: Configured for Unsplash and external image domains
- **Sticky Navigation**: Fixed navbar positioning with scroll overlap prevention

### 🚀 **Ready to Use**

The application is **fully functional** with a complete event management workflow:

1. **Users can register/login** with email or OAuth
2. **Organizers can create events** with full details
3. **Attendees can browse and purchase tickets**
4. **Dashboard analytics** for organizers
5. **Ticket management** for attendees

### 🌐 **Access Your Application**

```bash
# Development server is running at:
http://localhost:3000
```

### 📋 **Quick Test Workflow**

1. **Register as Organizer** → Create Event → View Dashboard
2. **Register as Attendee** → Browse Events → Purchase Tickets → Complete Payment
3. **Check My Tickets** → View Purchase History → See Completed Payments
4. **Verify Attendee Counts** → Browse Events → See Real-time Attendee Numbers

### 🔧 **Recent Fixes & Improvements**

- **Fixed Attendee Count Display**: Now shows real-time counts from actual ticket purchases
- **Improved Payment Flow**: Added realistic payment modal with card form validation
- **Enhanced Navigation**: Fixed sticky navbar with proper scroll behavior
- **Image Configuration**: Configured Next.js for external image domains (Unsplash)
- **Date Handling**: Fixed date serialization issues in ticket display
- **Field Mapping**: Corrected database field mapping inconsistencies

---

## 🚀 Features

### Core Functionality

- **Event Discovery**: Browse and search events with advanced filtering
- **User Authentication**: Secure authentication with NextAuth.js supporting email/password and OAuth (Google)
- **Role-Based Access**: Separate experiences for organizers and attendees
- **Event Management**: Create, edit, and manage events with comprehensive details
- **Ticket Management**: Multiple ticket types with pricing and availability tracking
- **Responsive Design**: Mobile-first design using Shadcn UI components

### For Event Organizers

- Create and publish events with rich details
- Manage multiple ticket types with different pricing
- Real-time sales analytics and reporting
- Event status management (draft, published, cancelled)
- Attendee management and insights

### For Attendees

- Discover events through search and filtering
- Purchase tickets with secure payment integration
- View purchased tickets with QR codes
- Personal ticket management dashboard

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Authentication**: NextAuth.js v5 (beta) with credentials provider
- **Database**: MongoDB Atlas with Mongoose ODM
- **UI Components**: Shadcn UI + Tailwind CSS
- **Validation**: Zod schemas for form and API validation
- **Forms**: React Hook Form with payment simulation
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout
- **Image Optimization**: Next.js Image with external domain support

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── events/            # Event-related pages
│   ├── dashboard/         # Organizer dashboard
│   └── my-tickets/        # User ticket management
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── forms/            # Form components
│   ├── events/           # Event-specific components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
│   ├── auth/             # Authentication configuration
│   ├── db/               # Database models and connection
│   └── validations/      # Zod schemas
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🗄 Database Schema

### User Model

```typescript
interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: "organizer" | "attendee";
  profilePicture?: string;
  companyName?: string;
  contactDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Event Model

```typescript
interface IEvent {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  ticketTypes: ITicketType[];
  imageUrl?: string;
  status: "draft" | "published" | "cancelled";
  organizerId: ObjectId;
  categoryId?: ObjectId;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Ticket Model

```typescript
interface ITicket {
  _id: string;
  eventId: ObjectId;
  userId: ObjectId;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  qrCode?: string;
  status: "active" | "used" | "refunded";
  paymentStatus: "pending" | "completed" | "failed";
  purchaseDate: Date;
  confirmationCode: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd event-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env.local` and configure:

   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management

   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # JWT
   JWT_SECRET=your-jwt-secret-key-here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Adding Shadcn UI Components

```bash
npx shadcn@latest add [component-name]
```

## 🔒 Security Features

- **Authentication**: Secure session management with NextAuth.js
- **Input Validation**: Zod schemas for both client and server-side validation
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Secure handling of sensitive information
- **Password Hashing**: bcryptjs for secure password storage

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Built-in accessibility features with Shadcn UI
- **Loading States**: Skeleton loaders and proper loading indicators
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Dark Mode**: Optional dark mode support

## 📊 Performance Optimizations

- **Next.js Optimizations**: Image optimization, code splitting, and SSR/SSG
- **Database Indexing**: Proper MongoDB indexing for optimal query performance
- **Caching Strategy**: Strategic caching for improved performance
- **Bundle Optimization**: Tree shaking and code splitting

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Configure network access and authentication
3. Update `MONGODB_URI` in your environment variables
4. Ensure proper indexing for optimal performance

### Next.js Image Configuration

The project is configured to support external image domains including Unsplash. The `next.config.ts` file includes:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    {
      protocol: 'https',
      hostname: 'plus.unsplash.com',
    },
  ],
},
```

## 🔮 Future Enhancements

- [ ] Real payment integration (Stripe/PayPal) to replace payment simulation
- [ ] Email notifications for ticket purchases and event updates
- [ ] Event reviews and ratings system
- [ ] Advanced analytics dashboard with detailed metrics
- [ ] Mobile app (React Native)
- [ ] Social sharing features
- [ ] Event recommendation system
- [ ] Multi-language support
- [ ] QR code generation for tickets
- [ ] Event check-in system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support, email support@eventhub.com or join our Slack channel.

---

Built with ❤️ using Next.js and modern web technologies.
