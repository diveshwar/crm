import { signIn } from 'next-auth/react';

const LoginButton = () => {
  return (
    <button onClick={() => signIn('google')}>
      Sign in with Google
    </button>
  );
};

export default LoginButton; 