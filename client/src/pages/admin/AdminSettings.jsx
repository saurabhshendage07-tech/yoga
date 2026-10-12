import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Bell,
  RotateCcw,
  Save,
  CheckCircle2,
  Info,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { getStudioSettings, saveStudioSettings } from '../../services/settingService';
import { autoSeedAllFirestoreCollections } from '../../services/seedFirestoreService';

export default function AdminSettings() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    studioName: 'PranaVeda Yoga & Wellness',
    email: 'namaste@pranavedayoga.com',
    phone: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    address: 'Ram Mandir Chowk, Sangli, Maharashtra - 416416',
    workingHours: 'Mon - Sat: 5:30 AM - 8:30 PM | Sun: 6:00 AM - 12:00 PM',
    razorpayKeyId: 'rzp_test_PranaVeda2026',
    whatsappAutoNotification: true,
    smsAutoNotification: true
  });

  const [loading, setLoading] = useState(false);

  // Password Change State
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    getStudioSettings()
      .then(data => {
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveStudioSettings(settings);
      showToast('Studio settings saved to Firestore successfully!', 'success');
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwdData.newPassword) {
      showToast('Please enter a new password.', 'error');
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }
    if (pwdData.newPassword.length < 4) {
      showToast('Password must be at least 4 characters.', 'error');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'saurabhshendage07@gmail.com',
          userId: user?.id || user?.uid,
          currentPassword: pwdData.currentPassword,
          newPassword: pwdData.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Admin password updated and saved in Firestore successfully! 🙏', 'success');
        setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.message || 'Failed to update password', 'error');
      }
    } catch {
      showToast('Error changing password. Please check backend connection.', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Sync and save all default initial courses, students, settings, payments, attendance & notifications directly into your Firestore database collections?')) return;
    try {
      const res = await autoSeedAllFirestoreCollections({ force: true });
      if (res.success) {
        showToast('All collections & data successfully saved to your Firestore database! 🔥', 'success');
      } else {
        showToast('Completed with notes: ' + (res.error || 'Check logs'), 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving data to Firestore: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#24362C]">Studio Settings & Security</h1>
        <p className="text-xs text-[#6A7E72] mt-0.5">
          Configure studio profile, change Admin password, manage Razorpay credentials and notifications.
        </p>
      </div>

      {/* Section: Admin Security & Password Change */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2D4A3E]" />
            Admin Security & Password
          </h2>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EAE3D6] text-[#2D4A3E] flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-[#C59B63]" />
            {user?.email || 'saurabhshendage07@gmail.com'}
          </span>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">Current Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter current password"
                value={pwdData.currentPassword}
                onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">New Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter new password"
                value={pwdData.newPassword}
                onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">Confirm New Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={pwdData.confirmPassword}
                onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C] focus:ring-2 focus:ring-[#55755E] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="text-[11px] text-[#55695C] hover:text-[#24362C] flex items-center gap-1 cursor-pointer"
            >
              {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPwd ? 'Hide Passwords' : 'Show Passwords'}</span>
            </button>

            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 rounded-xl bg-[#2D4A3E] hover:bg-[#1E2E25] text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#E2B887]" />
              <span>{pwdLoading ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Studio Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#55755E]" />
            Studio Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">Studio Name</label>
              <input
                type="text"
                value={settings.studioName}
                onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C]"
              />
            </div>

            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">Primary Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C]"
              />
            </div>

            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C]"
              />
            </div>

            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">WhatsApp Official Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4A5D50] font-semibold mb-1">Studio Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C]"
            />
          </div>

          <div>
            <label className="block text-[#4A5D50] font-semibold mb-1">Working & Class Hours</label>
            <input
              type="text"
              value={settings.workingHours}
              onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D5CABE] text-[#24362C]"
            />
          </div>
        </div>

        {/* Section 2: Payment Gateway Status */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#55755E]" />
            Razorpay & UPI Payment Settings
          </h2>

          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] space-y-2 text-[#4A5D50]">
            <div className="flex items-center gap-2 font-semibold text-[#2D4A3E]">
              <CheckCircle2 className="w-4 h-4 text-[#55755E]" />
              <span>Backend Signature Verification: Active (HMAC SHA-256)</span>
            </div>
            <p className="text-xs text-[#6A7E72]">
              Configured via server <code className="font-mono bg-[#EFE9DF] px-1.5 py-0.5 rounded text-[#2D4A3E]">.env</code> keys: <code className="font-mono">RAZORPAY_KEY_ID</code> and <code className="font-mono">RAZORPAY_KEY_SECRET</code>.
            </p>
          </div>
        </div>

        {/* Section 3: WhatsApp & SMS Automation */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1DBD1] shadow-xs space-y-4">
          <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#55755E]" />
            WhatsApp & SMS Automated Triggers
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsappAutoNotification}
                onChange={(e) => setSettings({ ...settings, whatsappAutoNotification: e.target.checked })}
                className="w-4 h-4 rounded text-[#2D4A3E] focus:ring-[#55755E]"
              />
              <span className="font-semibold text-[#24362C]">
                Automatically dispatch WhatsApp welcome confirmation upon verified enrollment
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsAutoNotification}
                onChange={(e) => setSettings({ ...settings, smsAutoNotification: e.target.checked })}
                className="w-4 h-4 rounded text-[#2D4A3E] focus:ring-[#55755E]"
              />
              <span className="font-semibold text-[#24362C]">
                Automatically dispatch SMS text message to student's mobile number
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full bg-[#2D4A3E] hover:bg-[#233B2B] text-white font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDemoData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      </form>
    </div>
  );
}
