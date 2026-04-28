import { ForgotPasswordForm } from '@/components/forgot-password-form'

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#F5F0E7] px-6 py-10 md:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(177,146,113,0.22),transparent_62%)]" />
      <div className="pointer-events-none absolute -left-16 top-20 h-48 w-48 rounded-full bg-[rgba(125,91,63,0.08)] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-56 w-56 rounded-full bg-[rgba(125,91,63,0.08)] blur-3xl" />
      <div className="relative w-full max-w-lg">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
