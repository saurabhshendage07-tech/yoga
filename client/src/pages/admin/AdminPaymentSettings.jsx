import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode,
  Upload,
  Trash2,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Eye,
  CreditCard,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { getPaymentSettings, savePaymentSettings } from '../../services/paymentService';

export default function AdminPaymentSettings() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    id: 'payment_settings_default',
    qr_code_url: '',
    upi_id: 'yogaclass@upi',
    payment_instructions: 'Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app.',
    is_active: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Fetch settings on mount
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getPaymentSettings();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      showToast('Error loading payment settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings Form
  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    try {
      const saved = await savePaymentSettings({
        upi_id: settings.upi_id,
        payment_instructions: settings.payment_instructions,
        is_active: settings.is_active,
        qr_code_url: settings.qr_code_url
      });

      setSettings(prev => ({ ...prev, ...saved }));
      showToast('Payment settings saved to Firestore!', 'success');
    } catch (err) {
      showToast(err.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Upload or Replace QR Code
  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid image type. Allowed: PNG, JPG, JPEG, WEBP.', 'error');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        const res = await fetch('/api/payments/upload-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': user?.role || 'admin',
            'x-user-email': user?.email || 'admin@pranavedayoga.com'
          },
          body: JSON.stringify({ imageBase64: reader.result })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to upload QR code');
        }

        setSettings(prev => ({
          ...prev,
          qr_code_url: data.data.qr_code_url,
          is_active: true
        }));
        showToast('QR code uploaded successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Error uploading QR image', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove QR Code
  const handleRemoveQr = async () => {
    if (!window.confirm('Are you sure you want to remove the current QR code? Users will not be able to pay online until a new QR code is uploaded.')) {
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/payments/remove-qr', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.role || 'admin',
          'x-user-email': user?.email || 'admin@pranavedayoga.com'
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove QR code');
      }

      setSettings(prev => ({
        ...prev,
        qr_code_url: '',
        is_active: false
      }));
      showToast('QR code removed successfully.', 'info');
    } catch (err) {
      showToast(err.message || 'Error removing QR code', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Auto-generate QR code for UPI ID
  const handleAutoGenerateQr = async () => {
    if (!settings.upi_id.trim()) {
      showToast('Please enter a valid UPI ID first.', 'error');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/payments/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.role || 'admin',
          'x-user-email': user?.email || 'admin@pranavedayoga.com'
        },
        body: JSON.stringify({ upi_id: settings.upi_id.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate QR code');
      }

      setSettings(prev => ({
        ...prev,
        qr_code_url: data.data.qr_code_url,
        is_active: true
      }));
      showToast('High-resolution QR code generated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error generating QR code', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyUpi = () => {
    if (settings.upi_id) {
      navigator.clipboard.writeText(settings.upi_id);
      setCopiedUpi(true);
      showToast('UPI ID copied!', 'success');
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#24362C]">Payment Settings</h1>
          <p className="text-xs text-[#6A7E72] mt-0.5">
            Configure dynamic UPI QR code, UPI ID, payment instructions, and manage student payment gateways.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D4A3E] text-white text-xs font-bold hover:bg-[#233B2B] shadow-md transition disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#E2B887]" />
              <span>Save Payment Settings</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Settings Card */}
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E1DBD1] shadow-xs space-y-6">
            <h2 className="text-base font-serif font-bold text-[#24362C] flex items-center gap-2 pb-3 border-b border-[#F0EAE1]">
              <CreditCard className="w-4 h-4 text-[#55755E]" />
              UPI & QR Code Configuration
            </h2>

            {/* UPI ID Field */}
            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">
                UPI ID *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.upi_id}
                  onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                  placeholder="e.g. yogaclass@upi or studio@okicici"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-[#FBF9F5] text-[#24362C] font-mono text-xs focus:ring-2 focus:ring-[#55755E] focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={handleAutoGenerateQr}
                  disabled={generating}
                  title="Generate QR code for this UPI ID"
                  className="px-3.5 py-2.5 rounded-xl bg-[#EFE9DF] hover:bg-[#E5DDCF] text-[#2D4A3E] font-semibold flex items-center gap-1.5 shrink-0 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  <span>{generating ? 'Generating...' : 'Auto-Generate'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#869A8C] mt-1">
                This UPI ID is displayed to students and encoded into the QR code.
              </p>
            </div>

            {/* Payment Instructions Field */}
            <div>
              <label className="block text-[#4A5D50] font-semibold mb-1">
                Payment Instructions
              </label>
              <textarea
                rows="3"
                value={settings.payment_instructions}
                onChange={(e) => setSettings({ ...settings, payment_instructions: e.target.value })}
                placeholder="e.g. Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CABE] bg-[#FBF9F5] text-[#24362C] text-xs focus:ring-2 focus:ring-[#55755E] focus:outline-none leading-relaxed"
              ></textarea>
              <p className="text-[11px] text-[#869A8C] mt-1">
                Helper instructions visible beneath the QR code on the payment screen.
              </p>
            </div>

            {/* Active Toggle Switch */}
            <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#24362C]">Online UPI Payment Status</p>
                <p className="text-[11px] text-[#869A8C]">
                  {settings.is_active && settings.qr_code_url
                    ? 'Active: Students can view QR and submit payment UTR.'
                    : 'Disabled: Students see the "payment assistance" fallback notice.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.is_active && Boolean(settings.qr_code_url)}
                  disabled={!settings.qr_code_url}
                  onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D4A3E]"></div>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#2D4A3E] hover:bg-[#233B2B] text-white font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#E2B887]" />
                <span>{saving ? 'Saving...' : 'Save Payment Settings'}</span>
              </button>
            </div>
          </form>

          {/* Security & System Info Box */}
          <div className="p-5 rounded-3xl bg-[#EFE9DF]/60 border border-[#DDD5C7] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#2D4A3E]">
              <Sparkles className="w-4 h-4 text-[#C59B63]" />
              <span>Dynamic Payment Architecture</span>
            </div>
            <p className="text-[11px] text-[#55695C] leading-relaxed">
              All payment QR codes and UPI IDs are served dynamically from this settings record. Student submissions are automatically placed in <strong>Pending Verification</strong> status until you explicitly verify or reject them from the Enrollments dashboard.
            </p>
          </div>
        </div>

        {/* Right Column: QR Code Management & Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* QR Code Action Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E1DBD1] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <h3 className="font-serif font-bold text-sm text-[#24362C] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#55755E]" />
                UPI QR CODE
              </h3>
              {settings.qr_code_url && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                  Configured
                </span>
              )}
            </div>

            {/* QR Preview Area */}
            <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE3D6] flex flex-col items-center justify-center min-h-[220px]">
              {settings.qr_code_url ? (
                <div className="space-y-3 text-center">
                  <div className="w-48 h-48 mx-auto p-2 bg-white rounded-xl border border-[#DDD5C7] shadow-sm flex items-center justify-center">
                    <img
                      src={settings.qr_code_url}
                      alt="Current QR Code"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] text-[#6A7E72] font-mono truncate max-w-[200px]">
                    {settings.qr_code_url}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-gray-600">No QR Code Uploaded</p>
                  <p className="text-[11px] text-gray-400 max-w-[200px]">
                    Upload a custom QR image or click "Auto-Generate" using your UPI ID.
                  </p>
                </div>
              )}
            </div>

            {/* QR Action Buttons: Upload, Replace, Remove */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Upload / Replace QR */}
                <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D4A3E] hover:bg-[#233B2B] text-white text-xs font-semibold cursor-pointer shadow-xs transition text-center">
                  <Upload className="w-3.5 h-3.5 text-[#E2B887]" />
                  <span>{settings.qr_code_url ? 'Replace QR Code' : 'Upload QR Code'}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleQrUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>

                {/* Remove QR */}
                <button
                  type="button"
                  onClick={handleRemoveQr}
                  disabled={!settings.qr_code_url || uploading}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove QR Code</span>
                </button>
              </div>

              <p className="text-[10px] text-[#869A8C] text-center">
                Supported formats: PNG, JPG, JPEG, WEBP (Max 5MB)
              </p>
            </div>
          </div>

          {/* Student Screen Preview Card */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E1DBD1] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#55755E]">
                Student View Preview
              </span>
              <Eye className="w-3.5 h-3.5 text-[#55755E]" />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E4DDD3] shadow-xs text-center space-y-3">
              <p className="text-xs font-serif font-bold text-[#24362C]">Complete Your Payment</p>
              
              <div className="p-2 rounded-xl bg-[#FBF9F5] border border-[#EAE3D6] flex justify-between text-[11px]">
                <span className="font-semibold text-[#2D4A3E]">Yoga Course</span>
                <span className="font-bold text-[#24362C]">₹1,999</span>
              </div>

              {settings.qr_code_url && settings.is_active ? (
                <>
                  <div className="w-32 h-32 mx-auto p-1.5 bg-white border border-[#2D4A3E] rounded-xl flex items-center justify-center">
                    <img src={settings.qr_code_url} alt="Preview QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] text-[#55695C] font-medium px-2">
                    {settings.payment_instructions}
                  </p>
                  <div className="inline-block px-3 py-1 rounded-lg bg-[#F7F4EE] border text-[10px] font-mono text-[#24362C]">
                    UPI ID: {settings.upi_id}
                  </div>
                </>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200">
                  Online payment currently unavailable. Contact studio assistance.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
