import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connection';
import { loginSchema } from '@/lib/validations/auth';

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);
          
          await connectToDatabase();
          const user = await User.findOne({ email });
          
          if (!user) {
            return null;
          }
          
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            profilePicture: user.profilePicture,
            companyName: user.companyName,
            contactDetails: user.contactDetails,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.profilePicture = user.profilePicture;
        token.companyName = user.companyName;
        token.contactDetails = user.contactDetails;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.profilePicture = token.profilePicture as string;
        session.user.companyName = token.companyName as string;
        session.user.contactDetails = token.contactDetails as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user for OAuth sign-in
            const newUser = new User({
              email: user.email,
              name: user.name,
              role: 'attendee', // Default role for OAuth users
              profilePicture: user.image || '',
              password: '', // OAuth users don't have passwords
            });
            await newUser.save();
            
            user.id = newUser._id.toString();
            user.role = newUser.role;
          } else {
            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.profilePicture = existingUser.profilePicture;
            user.companyName = existingUser.companyName;
            user.contactDetails = existingUser.contactDetails;
          }
        } catch (error) {
          console.error('OAuth sign-in error:', error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
