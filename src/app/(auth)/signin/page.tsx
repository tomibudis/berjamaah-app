import SignInForm from "@/features/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Mobile-first container with max-width for desktop */}
      <div className="mx-auto max-w-sm px-4 py-8 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <SignInForm />
      </div>
    </div>
  );
}
