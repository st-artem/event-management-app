import { useState } from 'react';
import { X, Github, Globe, Send, MapPin, FileText, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { type EditProfileData } from '../types';


interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: EditProfileData;
  onSaved: (updated: EditProfileData) => void;
}

export function EditProfileModal({ isOpen, onClose, initialData, onSaved }: EditProfileModalProps) {
  const token = useAuthStore((state) => state.token);
  const [form, setForm] = useState<EditProfileData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof EditProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.patch(`${import.meta.env.VITE_API_URL}/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSaved(res.data);
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-brand-darkCard rounded-2xl shadow-2xl border border-gray-100 dark:border-brand-darkBorder overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-brand-darkBorder">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-brand-darkBg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          <Field label="Name" icon={<User size={15} />}>
            <input
              type="text"
              value={form.name ?? ''}
              onChange={handleChange('name')}
              placeholder="Your name"
              className={inputCls}
            />
          </Field>

          <Field label="Bio" icon={<FileText size={15} />}>
            <textarea
              value={form.bio ?? ''}
              onChange={handleChange('bio')}
              placeholder="Tell something about yourself..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Location" icon={<MapPin size={15} />}>
            <input
              type="text"
              value={form.location ?? ''}
              onChange={handleChange('location')}
              placeholder="City, Country"
              className={inputCls}
            />
          </Field>

          <div className="pt-1 border-t border-gray-100 dark:border-brand-darkBorder">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Social Links</p>
            <div className="space-y-3">
              <Field label="GitHub" icon={<Github size={15} />}>
                <input
                  type="text"
                  value={form.github ?? ''}
                  onChange={handleChange('github')}
                  placeholder="https://github.com/username"
                  className={inputCls}
                />
              </Field>

              <Field label="Website" icon={<Globe size={15} />}>
                <input
                  type="text"
                  value={form.website ?? ''}
                  onChange={handleChange('website')}
                  placeholder="https://yoursite.com"
                  className={inputCls}
                />
              </Field>

              <Field label="Telegram" icon={<Send size={15} />}>
                <input
                  type="text"
                  value={form.telegram ?? ''}
                  onChange={handleChange('telegram')}
                  placeholder="@username"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-brand-darkBorder">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-brand-darkBg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-brand-darkBg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl border border-gray-200 dark:border-brand-darkBorder focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-colors";

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
        <span className="text-brand-blue">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}