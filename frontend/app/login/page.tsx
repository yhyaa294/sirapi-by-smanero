"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false); // State for shake animation
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShake(false);

    try {
      // Simulasi server delay 1.5 detik
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const validUser = formData.username === "admin" || formData.username === "syarifuddinudin526@gmail.com";
      const validPass = formData.password === "123";

      if (validUser && validPass) {
        router.push("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError("Access Denied: Invalid Username or Password.");
      setIsLoading(false);
      setShake(true); // Trigger shake
      setTimeout(() => setShake(false), 500); // Reset shake state
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error when typing
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-950 font-sans text-slate-200 selection:bg-orange-500/30">
      
      {/* KIRI (55% - Visual) */}
      <div className="hidden lg:flex w-[55%] relative flex-col items-center justify-center overflow-hidden bg-slate-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
           {/* Menggunakan .png sesuai file yg ada */}
           <Image
             src="/images/background orang landing page.png"
             alt="Industrial Background"
             fill
             className="object-cover opacity-30 mix-blend-overlay scale-105"
             priority
           />
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
           
           {/* Animated Grid Overlay */}
           <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:40px_40px] opacity-10"></div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg px-6">
          
          {/* Pulsing Ring behind Logo */}
          <div className="relative">
            <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative h-32 w-32 rounded-full border-2 border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.2)] overflow-hidden bg-black group">
              <Image 
                src="/images/logo-smartapd.jpg"
                alt="SmartAPD Logo"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              SMART<span className="text-orange-500">APD</span>
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-500 to-transparent mx-auto"></div>
            <p className="text-xl text-slate-300 font-light italic leading-relaxed">
              &ldquo;Safety is not just a priority, it&apos;s a value.&rdquo;
            </p>
          </div>

          {/* Footer Badges */}
          <div className="absolute bottom-[-30vh] flex gap-6 opacity-50">
             <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest">
               <ShieldCheck className="w-4 h-4" />
               Enterprise Grade Security
             </div>
          </div>
        </div>
      </div>

      {/* KANAN (45% - Form) */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-slate-950 relative">
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Welcome Back, Commander.
            </h2>
            <p className="text-slate-400 text-sm">
              Enter your credentials to access the HSE Command Center.
            </p>
          </div>

          {/* Form with Shake Animation */}
          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-6"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Username / Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                  placeholder="Enter ID or Email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, mb: 0 }}
                  animate={{ opacity: 1, height: "auto", mb: 12 }}
                  exit={{ opacity: 0, height: 0, mb: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  ACCESS SYSTEM
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </motion.form>

          {/* Footer */}
          <div className="pt-4 text-center">
             <p className="text-xs text-slate-600">
               Forgot Password? <span className="text-slate-400 hover:text-orange-500 cursor-pointer transition-colors">Contact IT Administrator.</span>
             </p>
             <div className="mt-8 flex justify-center gap-4 opacity-20 grayscale hover:grayscale-0 hover:opacity-50 transition-all">
               {/* Dummy logos for trust */}
               <div className="h-6 w-16 bg-white/10 rounded"></div>
               <div className="h-6 w-16 bg-white/10 rounded"></div>
               <div className="h-6 w-16 bg-white/10 rounded"></div>
             </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
