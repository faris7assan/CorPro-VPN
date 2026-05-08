import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Shield, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function PasswordRecovery() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const token = searchParams.get("code");
    if (!token) {
      setError("Invalid or missing recovery token");
      setCheckingToken(false);
      return;
    }
    setIsValidToken(true);
    setCheckingToken(false);
  }, [searchParams]);

  const validatePassword = (pass) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(pass);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be 8+ chars with upper, lower, and special characters",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw new Error(updateError.message);

      setSuccess(true);
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="h-screen w-full bg-[#060818] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="text-cyan-400 animate-spin mx-auto mb-4"
          />
          <p className="text-slate-400">Verifying recovery token...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="h-screen w-full bg-[#060818] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-8 border border-red-500/20 text-center">
            <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Invalid Recovery Link
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              The password recovery link is invalid or has expired. Request a
              new one from the login page.
            </p>
            <a
              href="/auth"
              className="inline-block px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all"
            >
              Return to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen w-full bg-[#060818] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-8 border border-emerald-500/20 text-center animate-fade-in">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Password Updated!
            </h1>
            <p className="text-slate-400 text-sm">
              Your password has been successfully updated. Redirecting to
              login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#060818] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8 border border-cyan-500/20">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="text-white w-7 h-7" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm text-center mb-6">
            Enter your new password below
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8+ chars, upper, lower, special"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
                required
              />
              <p className="text-[10px] text-slate-600 mt-1">
                Must contain uppercase, lowercase, and special characters
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-cyan-600 hover:bg-cyan-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating...
                </>
              ) : (
                <>Update Password</>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-600 text-center mt-4">
            Remember your password?{" "}
            <a href="/auth" className="text-cyan-400 hover:text-cyan-300">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
