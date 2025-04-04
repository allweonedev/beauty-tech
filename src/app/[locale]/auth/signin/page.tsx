"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  const t = useTranslations("auth.signIn");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            {t("welcomeBack")}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInForm
            emailLabel={t("email")}
            emailPlaceholder={t("emailPlaceholder")}
            passwordLabel={t("password")}
            forgotPasswordLabel={t("forgotPassword")}
            buttonLabel={t("signInButton")}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("orContinueWith")}
              </span>
            </div>
          </div>
          <GoogleSignInButton label={t("googleButton")} />
        </CardContent>
        <CardFooter className="flex justify-center">
          {/* Signup option removed to limit number of accounts */}
        </CardFooter>
      </Card>
    </div>
  );
}
