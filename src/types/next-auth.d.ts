import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      profilePicture?: string;
      companyName?: string;
      contactDetails?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
    profilePicture?: string;
    companyName?: string;
    contactDetails?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string;
    profilePicture?: string;
    companyName?: string;
    contactDetails?: string;
  }
}
