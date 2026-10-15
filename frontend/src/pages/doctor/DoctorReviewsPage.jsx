import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import {
  Star,
  Users,
  CheckCircle2,
  Calendar,
  Filter,
  Loader2,
  AlertCircle,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

export default function DoctorReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState('4.9');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starFilter, setStarFilter] = useState('all');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getReviews();
      if (res.success) {
        setReviews(res.reviews || []);
        if (res.average_rating) setAverageRating(res.average_rating);
      } else {
        setError('Failed to fetch reviews.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredReviews = reviews.filter((r) => {
    if (starFilter === 'all') return true;
    return r.rating === parseInt(starFilter, 10);
  });

  const totalReviews = reviews.length;
  const fiveStars = reviews.filter((r) => r.rating === 5).length;
  const fourStars = reviews.filter((r) => r.rating === 4).length;

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Reviews & Ratings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Verified patient feedback from completed telemedicine consultations.
          </p>
        </div>

        {/* Rating Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Average Rating Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Practice Rating</span>
            <div className="flex items-center gap-2">
              <span className="text-5xl font-black text-slate-900">{averageRating}</span>
              <span className="text-xl text-slate-400 font-bold">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Based on {totalReviews} verified patient consultation reviews
            </p>
          </div>

          {/* Rating Breakdown Bars */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm flex flex-col justify-center space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Rating Distribution</h3>
            
            {/* 5 Stars */}
            <div className="flex items-center gap-3 text-xs">
              <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                5 <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalReviews > 0 ? (fiveStars / totalReviews) * 100 : 90}%` }}
                />
              </div>
              <span className="w-12 text-right text-slate-500 font-medium">{fiveStars}</span>
            </div>

            {/* 4 Stars */}
            <div className="flex items-center gap-3 text-xs">
              <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                4 <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalReviews > 0 ? (fourStars / totalReviews) * 100 : 10}%` }}
                />
              </div>
              <span className="w-12 text-right text-slate-500 font-medium">{fourStars}</span>
            </div>

            {/* 3 Stars */}
            <div className="flex items-center gap-3 text-xs">
              <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                3 <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '0%' }} />
              </div>
              <span className="w-12 text-right text-slate-500 font-medium">0</span>
            </div>
          </div>

        </div>

        {/* Filter Pills */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8eef5] shadow-sm flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', '5', '4', '3'].map((rating) => (
            <button
              key={rating}
              onClick={() => setStarFilter(rating)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                starFilter === rating
                  ? 'bg-[#1677ff] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {rating === 'all' ? 'All Ratings' : `${rating} Stars`}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 flex flex-col items-center justify-center text-slate-400 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1677ff]" />
            <p className="text-sm font-medium">Loading patient feedback...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#1677ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No reviews found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              There are no reviews matching the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-[#1677ff] font-bold flex items-center justify-center">
                      {rev.patient_name ? rev.patient_name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rev.patient_name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Consultation
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">{formatDate(rev.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 self-start sm:self-auto">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed pt-1">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
