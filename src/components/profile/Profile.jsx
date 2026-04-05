import { useState, useMemo } from "react";
import { Mail, Calendar, Briefcase, User, ShieldCheck, Clock, MapPin, Activity, Pencil, X, Check } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";

const DEFAULT_PROFILE = {
  name: "Kolluri Ravi Teja",
  email: "kolluriraviteja246@gmail.com",
  occupation: "Software Developer",
  dob: "11-06-2003",
  age: "22",
  location: "India",
  timezone: "IST (UTC+5:30)",
};

export const Profile = () => {
  const { role, formatDateDisplay } = useFinance();
  const isAdmin = role === "Admin";

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("dashboard_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });
  const [draft, setDraft] = useState(profile);

  const handleEdit = () => {
    setDraft({ ...profile });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(draft);
    localStorage.setItem("dashboard_profile", JSON.stringify(draft));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const initials = profile.name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const Field = ({ icon: Icon, label, field }) => (
    <div className="group flex flex-col">
      <span className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold tracking-widest mb-2 flex items-center">
        <Icon className="w-3.5 h-3.5 mr-1.5" /> {label}
      </span>
      {isEditing ? (
        <input
          value={draft[field]}
          onChange={e => handleChange(field, e.target.value)}
          className="text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      ) : (
        <span className="text-base font-semibold text-slate-800 dark:text-white">
          {field === 'dob' ? formatDateDisplay(profile[field]) : profile[field]}
        </span>
      )}
    </div>
  );

  return (
    <div className="relative space-y-6 animate-slide-up stagger-1 mb-8 z-10">

      {/* Content sits above the balls */}
      <div className="relative z-10 flex items-start justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            Hello, {profile.name}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Here are your Profile settings and personal details.</p>
        </div>

        {isAdmin && !isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md hover:shadow-indigo-300 dark:hover:shadow-indigo-900 transition-all duration-200 shrink-0"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        )}

        {isAdmin && isEditing && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md hover:shadow-emerald-300 dark:hover:shadow-emerald-900 transition-all duration-200"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </div>
        )}
      </div>

      {isAdmin && isEditing && (
        <div className="relative z-10 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-xl px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300 font-medium">
          <Pencil className="w-4 h-4 shrink-0" />
          You are in edit mode. Modify the fields below and click <span className="font-bold mx-1">Save Changes</span> to apply.
        </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row gap-6">

        <div className="w-full md:w-1/3">
          <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-3xl p-6 shadow-[0_0_18px_rgba(99,102,241,0.15)] dark:shadow-[0_0_22px_rgba(99,102,241,0.25)] border-2 border-indigo-200 dark:border-indigo-500/40 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_0_35px_rgba(99,102,241,0.45)]">
            <div className="absolute top-0 -left-10 w-48 h-48 bg-emerald-400 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-[50px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 -right-10 w-48 h-48 bg-teal-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-[50px] opacity-20 pointer-events-none" />

            <div className="relative z-10 w-28 h-28 bg-emerald-100 dark:bg-indigo-900/50 rounded-full border-4 border-white dark:border-slate-700 shadow-xl flex items-center justify-center mb-4">
              <span className="text-4xl font-extrabold text-emerald-600 dark:text-indigo-400">{initials}</span>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 text-center">{profile.name}</h3>
            <p className="text-emerald-600 dark:text-indigo-400 font-medium mb-4 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Verified Developer
            </p>

            <div className={`mb-6 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
              isAdmin
                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
            }`}>
              {role} Access
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-700/60 pt-6 space-y-4">
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center mr-3 shrink-0">
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider">Age</span>
                  {isEditing ? (
                    <input
                      value={draft.age}
                      onChange={e => handleChange("age", e.target.value)}
                      className="text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-600 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 w-full mt-1"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{profile.age} Years</span>
                  )}
                </div>
              </div>

              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center mr-3 shrink-0">
                  <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider">Location</span>
                  {isEditing ? (
                    <input
                      value={draft.location}
                      onChange={e => handleChange("location", e.target.value)}
                      className="text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-600 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 w-full mt-1"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{profile.location}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 space-y-6">
          <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-[0_0_18px_rgba(5,150,105,0.15)] dark:shadow-[0_0_22px_rgba(16,185,129,0.2)] border-2 border-emerald-200 dark:border-emerald-700/50 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(5,150,105,0.35)] dark:hover:shadow-[0_0_35px_rgba(16,185,129,0.4)]">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center pb-4 border-b border-slate-100 dark:border-slate-700/60">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Field icon={Mail}      label="Email Address"  field="email" />
              <Field icon={Briefcase} label="Occupation"     field="occupation" />
              <Field icon={Calendar}  label="Date of Birth"  field="dob" />
              <Field icon={Clock}     label="Local Timezone" field="timezone" />
            </div>
          </div>

          <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-3xl p-6 shadow-[0_0_18px_rgba(245,158,11,0.15)] dark:shadow-[0_0_22px_rgba(245,158,11,0.2)] border-2 border-amber-200 dark:border-amber-700/40 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] dark:hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center mb-4">
              System Standing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-indigo-900/40 text-emerald-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Activity className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Account Active</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">Status Normal</p>
              </div>

              <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">2FA Verified</p>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">Secured</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
