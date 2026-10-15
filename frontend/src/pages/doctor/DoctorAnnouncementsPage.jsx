import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Send,
  Bell
} from 'lucide-react';

export default function DoctorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New announcement modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Clinic Update');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.announcements || []);
      } else {
        setError('Failed to fetch announcements.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.doctor.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        tag: tag.trim()
      });

      if (res.success) {
        setSuccessMsg('Announcement published to patient bulletin!');
        setTitle('');
        setContent('');
        setTag('Clinic Update');
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg(null);
          fetchAnnouncements();
        }, 1200);
      }
    } catch (err) {
      alert('Error publishing announcement: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.doctor.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement: ' + (err.message || 'Server error'));
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTagColor = (t) => {
    switch (t) {
      case 'Holiday Notice':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Health Tip':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Emergency Notice':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-[#1677ff] border-blue-200';
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Practice Announcements & Bulletins</h1>
            <p className="text-sm text-slate-500 mt-1">
              Broadcast clinic notices, holiday hours, preventative health tips, and slot updates to your patients.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1677ff] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Announcements List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 flex flex-col items-center justify-center text-slate-400 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1677ff]" />
            <p className="text-sm font-medium">Loading practice bulletins...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#1677ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No announcements yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Click &quot;New Announcement&quot; to publish your first clinic bulletin for patients.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getTagColor(ann.tag)}`}>
                      <Tag className="w-3 h-3" /> {ann.tag || 'General'}
                    </span>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Published {formatDate(ann.created_at)}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Visible to all registered patients
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* NEW ANNOUNCEMENT MODAL */}
        {/* ------------------------------------------------------------- */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#1677ff]" />
                  <h3 className="text-lg font-bold text-slate-900">Publish Practice Announcement</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Clinic Holiday Notice & Emergency Contact"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  >
                    <option value="Clinic Update">Clinic Update</option>
                    <option value="Holiday Notice">Holiday Notice</option>
                    <option value="Health Tip">Health Tip / Advisory</option>
                    <option value="Schedule Change">Schedule Change</option>
                    <option value="Emergency Notice">Emergency Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Content Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your announcement details for patients..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Publish Announcement
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
