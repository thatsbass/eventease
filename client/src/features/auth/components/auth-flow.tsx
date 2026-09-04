"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api/client";
import { authApi } from "../api/auth.api";
import {
  emailSchema,
  loginRequestSchema,
  registerRequestSchema,
  toUserSnapshot,
} from "../schemas/auth.schemas";
import { useAuthStore } from "../store/auth.store";
import { AuthShell } from "./auth-shell";
import { AuthEmailStep } from "./auth-email-step";
import { AuthLoginStep } from "./auth-login-step";
import { AuthRegisterStep } from "./auth-register-step";

type Step = "email" | "login" | "register";

const getErrorMessage = (err: unknown) => {
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? "Donnees invalides";
  }

  if (err instanceof ApiError) {
    return err.message || "Une erreur est survenue";
  }

  if (err instanceof Error) {
    return err.message || "Une erreur est survenue";
  }

  return "Une erreur est survenue";
};

export const AuthFlow = () => {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const checkEmailMutation = useMutation({
    mutationFn: (value: string) => authApi.checkEmail(value),
  });

  const loginMutation = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      authApi.login(values),
  });

  const registerMutation = useMutation({
    mutationFn: (values: {
      email: string;
      fullName: string;
      username: string;
      password: string;
    }) => authApi.register(values),
  });

  const isChecking = checkEmailMutation.isPending;
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  const title = useMemo(() => {
    if (step === "register") return "Creer un compte";
    return "Se connecter";
  }, [step]);

  const subtitle = useMemo(() => {
    if (step === "email") return "Entrez votre email pour continuer.";
    if (step === "login") return "Saisissez votre mot de passe.";
    return "Completez vos informations pour creer votre compte.";
  }, [step]);

  const resetToEmail = () => {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleEmailContinue = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const parsed = emailSchema.parse(email);
      const result = await checkEmailMutation.mutateAsync(parsed);
      setStep(result.exists ? "login" : "register");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const payload = loginRequestSchema.parse({ email, password });
      const tokens = await loginMutation.mutateAsync(payload);
      setTokens(tokens);

      const user = await authApi.me();
      setUser(toUserSnapshot(user));

      toaster.create({
        description: "Connexion reussie.",
        type: "success",
      });

      router.push("/events");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const payload = registerRequestSchema.parse({
        email,
        fullName,
        username,
        password,
      });

      const tokens = await registerMutation.mutateAsync(payload);
      setTokens(tokens);

      const user = await authApi.me();
      setUser(toUserSnapshot(user));

      toaster.create({
        description: "Compte cree. Vous etes connecte.",
        type: "success",
      });

      router.push("/events");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell title={title} subtitle={subtitle}>
      {step === "email" ? (
        <AuthEmailStep
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleEmailContinue}
          error={error}
          isSubmitting={isChecking}
        />
      ) : null}

      {step === "login" ? (
        <AuthLoginStep
          email={email}
          password={password}
          onPasswordChange={setPassword}
          onChangeEmail={resetToEmail}
          onSubmit={handleLogin}
          error={error}
          isSubmitting={isSubmitting}
        />
      ) : null}

      {step === "register" ? (
        <AuthRegisterStep
          email={email}
          fullName={fullName}
          username={username}
          password={password}
          confirmPassword={confirmPassword}
          onFullNameChange={setFullName}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onChangeEmail={resetToEmail}
          onSubmit={handleRegister}
          error={error}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </AuthShell>
  );
};
