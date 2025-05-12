import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css'; // Import your global styles if you have any

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp; 