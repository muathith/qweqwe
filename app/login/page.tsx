"use client";
import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { ShieldCheck, Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "link">("link");
  const navigate = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: window.location.href, // Redirect back to this same page
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email locally so you don't have to ask the user for it again
      // if they open the link on the same device.
      window.localStorage.setItem("emailForSignIn", email);
      setMessage(
        "تم إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد."
      );
    } catch (err: any) {
      console.error("Send link error:", err);
      setError("حدث خطأ أثناء إرسال الرابط. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  // Check if the user is returning from an email link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailToUse = window.localStorage.getItem("emailForSignIn");

      if (!emailToUse) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again.
        emailToUse = window.prompt("يرجى إدخال بريدك الإلكتروني للتأكيد:");
      }

      if (emailToUse) {
        setLoading(true);
        signInWithEmailLink(auth, emailToUse, window.location.href)
          .then(() => {
            window.localStorage.removeItem("emailForSignIn");
            navigate("/");
          })
          .catch((err) => {
            console.error("Link sign-in error:", err);
            setError("رابط تسجيل الدخول غير صالح أو منتهي الصلاحية.");
            setLoading(false);
          });
      }
    }
  }, [navigate]);

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth/invalid-credential":
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      case "auth/user-not-found":
        return "المستخدم غير موجود";
      case "auth/wrong-password":
        return "كلمة المرور غير صحيحة";
      case "auth/too-many-requests":
        return "تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً";
      default:
        return "حدث خطأ أثناء تسجيل الدخول";
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 font-sans"
      dir="rtl"
    >
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-300/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-300/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white bg-white/95 p-5 shadow-2xl backdrop-blur-sm sm:rounded-3xl sm:p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">
            لوحة التحكم
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            تسجيل الدخول للإدارة والمتابعة الفورية
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "password"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            كلمة المرور
          </button>
          <button
            onClick={() => setMode("link")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "link"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            رابط البريد
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleSendLink}
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password (only for password mode) */}
          {mode === "password" && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري المعالجة...
              </span>
            ) : (
              <>
                <span>
                  {mode === "password" ? "تسجيل الدخول" : "إرسال رابط الدخول"}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>واجهة محسّنة لعرض أسرع وتجربة أوضح</span>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-600 sm:text-sm">
          <p>© 2026 لوحة التحكم - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
