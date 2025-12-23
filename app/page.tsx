"use client"

import { useEffect,useState } from "react"
import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Code, Lock, Users } from "lucide-react"

export default function HomePage() {
  const auth = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = () => {
    setIsRedirecting(true);
  setTimeout(() => {
    router.push("/dashboard");
  }, 2000); 
};

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push("/dashboard")
    }
  }, [auth.isAuthenticated])

  if (auth.isLoading || isRedirecting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
        <Loader2 className="h-6 w-6 text-slate-600 dark:text-slate-400 animate-spin mb-2" />
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Initializing application</p>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-900/30 p-4 max-w-md w-full shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Authentication Error</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{auth.error.message}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-3">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h1 className="text-lg font-medium text-slate-800 dark:text-slate-200">DevSync</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Left column - Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                Collaborative Coding Environment
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                A secure, real-time code editor for teams to collaborate efficiently on projects.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-md">
                  <Users className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Real-time Collaboration</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Work together with your team in real-time, seeing changes as they happen.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-md">
                  <Lock className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Secure Authentication</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Powered by AWS Cognito for enterprise-grade security and user management.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Login */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-2">
                <Code className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </div>

              <h2 className="text-xl font-medium text-slate-900 dark:text-slate-200">Sign in to get started</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Access your collaborative coding workspace securely with AWS Cognito authentication.
              </p>

              <Button
                // onClick={() => auth.signinRedirect()}
                onClick={handleRedirect}
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 mt-2"
              >
                Sign in with Cognito
              </Button>

              <p className="text-xs text-slate-500 dark:text-slate-400 pt-4">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Collab Code Editor. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a
                href="#"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

