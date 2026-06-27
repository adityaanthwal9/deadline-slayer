import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#F59E0B',
            colorBackground: '#16161F',
            colorText: '#F8F8FC',
            colorInputBackground: '#1A1A24',
            colorInputText: '#F8F8FC',
            borderRadius: '8px',
          },
        }}
      />
    </div>
  );
}
