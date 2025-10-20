'use client';
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LocationSearch from "@/components/LocationSearch";
import VisibilityToggle from "@/components/VisibilityToggle";
import { GenderType, PrivacyLevel } from "@/types/profile";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";

interface UserData {
    username: string;
    email: string;
    fullname: string;
    password: string;
    confirmPassword: string;
}


interface ProfileData {
    dateOfBirth: string;
    dateOfBirthVisibility: PrivacyLevel;
    gender: GenderType;
    genderVisibility: PrivacyLevel;
    bio: string;
    location: string;
    locationVisibility: PrivacyLevel;
}

interface ValidationErrors {
    fullname?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    dateOfBirth?: string;
    gender?: string;
}

interface FormData {
    user: UserData;
    profile: ProfileData;
}

export default function Signup({
    initialStep = 1,
    userId = ''
}: {
    initialStep?: number;
    userId?: string;
}) {
    const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Password validation functions
    const validatePasswordLength = (password: string) => password.length >= 8;
    const validatePasswordLowercase = (password: string) => /[a-z]/.test(password);
    const validatePasswordUppercase = (password: string) => /[A-Z]/.test(password);
    const validatePasswordNumber = (password: string) => /\d/.test(password);
    const validatePasswordSpecial = (password: string) => /[-#@$!%*?&:;<>{}[\]()]/.test(password);

    const [step, setStep] = useState(initialStep);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        user: {
            username: '',
            email: '',
            fullname: '',
            password: '',
            confirmPassword: '',
        },
        profile: {
            dateOfBirth: '',
            dateOfBirthVisibility: 'friends',
            gender: 'male',
            genderVisibility: 'friends',
            bio: '',
            location: '',
            locationVisibility: 'friends'
        }
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case 'fullname':
                return !value.trim() ? 'Full name is required' : undefined;
            case 'username':
                return !USERNAME_REGEX.test(value) 
                    ? 'Username must be 3-16 characters and can only contain letters, numbers, underscores, and hyphens'
                    : undefined;
            case 'email':
                return !EMAIL_REGEX.test(value)
                    ? 'Please enter a valid email address'
                    : undefined;
            case 'password': {
                if (!value) return 'Password is required';
                const errors = [];
                if (!validatePasswordLength(value)) errors.push('At least 8 characters');
                if (!validatePasswordLowercase(value)) errors.push('One lowercase letter');
                if (!validatePasswordUppercase(value)) errors.push('One uppercase letter');
                if (!validatePasswordNumber(value)) errors.push('One number');
                if (!validatePasswordSpecial(value)) errors.push('One special character (-#@$!%*?&:;<>{}[]())');
                return errors.length > 0 ? errors.join(' • ') : undefined;
            }
            case 'confirmPassword':
                return value !== formData.user.password
                    ? 'Passwords do not match'
                    : undefined;
            case 'dateOfBirth':
                if (!value) return 'Date of birth is required';
                const birthDate = new Date(value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age < 13 ? 'You must be at least 13 years old' : undefined;
            case 'gender':
                return !value ? 'Please select your gender' : undefined;
            case 'location':
                return !value ? 'Please select your location' : undefined;
            default:
                return undefined;
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        
        // Update form data
        const isUserField = ['username', 'email', 'fullname', 'password', 'confirmPassword'].includes(name);
        setFormData(prev => ({
            ...prev,
            [isUserField ? 'user' : 'profile']: {
                ...prev[isUserField ? 'user' : 'profile'],
                [name]: value
            }
        }));

        // Validate the field
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // Special handling for password change - revalidate confirmPassword
        if (name === 'password' && formData.user.confirmPassword) {
            const confirmError = validateField('confirmPassword', formData.user.confirmPassword);
            setErrors(prev => ({
                ...prev,
                confirmPassword: confirmError
            }));
        }
    };

    const handleSubmit = async () => {
        if (step === 1) {
            try{
                setIsLoading(true);
            const response = await fetch("/api/auth/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: formData.user.username,
                email: formData.user.email,
                fullname: formData.user.fullname,
                password:formData.user.password,
              }),
            });

            const data = await response.json();

            if(response.ok){
                 setStep(2);
            }else{
                setErrors(prev => ({
                    ...prev,
                    submit: data.message || 'Signup Failed'
                }));
            }
            }catch (error){
                setErrors(prev => ({
                        ...prev,
                        submit: error instanceof Error ? error.message : 'An error occurred'
                    }));
            }
            finally{
                setIsLoading(false)
            }
        } else if (step === 2) {
            try {
              setIsLoading(true);
              const response = await fetchWithAuth("/api/protected/profile/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  dateOfBirth: formData.profile.dateOfBirth,
                  dateOfBirthVisibility: formData.profile.dateOfBirthVisibility,
                  gender: formData.profile.gender,
                  genderVisibility: formData.profile.genderVisibility,
                  bio:formData.profile.bio,
                  location:formData.profile.location,
                  locationVisibility:formData.profile.locationVisibility
                }),
              });

              const data = await response.json();

              if (response.ok) {
                setStep(2);
              } else {
                setErrors((prev) => ({
                  ...prev,
                  submit: data.message || "Profile Creation Failed",
                }));
              }
              router.push("/");
            } catch (error) {
              setErrors((prev) => ({
                ...prev,
                submit:
                  error instanceof Error ? error.message : "An error occurred",
              }));
            } finally {
              setIsLoading(false);
            }
        }
    };

    const isStepValid = () => {
        if (step === 1) {
            return (
                !errors.fullname &&
                !errors.username &&
                !errors.email &&
                !errors.password &&
                !errors.confirmPassword &&
                formData.user.fullname &&
                formData.user.username &&
                formData.user.email &&
                formData.user.password &&
                formData.user.confirmPassword
            );
        } else if (step === 2) {
            return (
                !errors.dateOfBirth &&
                !errors.gender &&
                formData.profile.dateOfBirth &&
                formData.profile.gender &&
                formData.profile.dateOfBirthVisibility &&
                formData.profile.genderVisibility &&
                formData.profile.locationVisibility
            );
        }
        return false;
    };

    const steps = [
        { number: 1, title: 'Create Account', description: 'Set up your login credentials' },
        { number: 2, title: 'Basic Info', description: 'Tell us about yourself' }
    ];

    const renderProgressBar = () => {
        return (
            <div className="mb-8">
                <div className="flex justify-between items-center w-full max-w-md mx-auto">
                    {steps.map((s, i) => (
                        <div key={s.number} className="flex flex-col items-center relative w-1/3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                s.number < step ? 'border-green-500 bg-green-50' : 
                                s.number === step ? 'border-indigo-600 bg-indigo-50' : 
                                'border-gray-300 bg-gray-50'
                            } transition-all duration-300`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    s.number < step ? 'bg-green-500' : 
                                    s.number === step ? 'bg-indigo-600' : 
                                    'bg-gray-300'
                                } text-white font-semibold text-sm transition-all duration-300`}>
                                    {s.number < step ? '✓' : s.number}
                                </div>
                            </div>
                            <div className="mt-3 text-center">
                                <div className={`font-medium ${
                                    step > s.number ? 'text-green-600' : 
                                    step === s.number ? 'text-indigo-600' : 
                                    'text-gray-400'
                                }`}>
                                    {s.title}
                                </div>
                                <div className={`text-sm ${
                                    step >= s.number ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                    {s.description}
                                </div>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="absolute top-6 left-1/2 w-full h-0.5 -z-10">
                                    <div className={`h-full transition-all duration-300 ${
                                        s.number < step ? 'bg-green-500' : 'bg-gray-300'
                                    }`} style={{ width: '100%' }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderStep = () => {
        const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 outline-none";
        const labelClasses = "text-sm font-medium text-gray-700 block";
        
        switch(step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label className={labelClasses}>Full Name</label>
                                <span className="text-xs text-gray-500">Required</span>
                            </div>
                            <input
                                type="text"
                                name="fullname"
                                value={formData.user.fullname}
                                onChange={handleInputChange}
                                className={`${inputClasses} ${errors.fullname ? 'ring-red-300 border-red-300' : ''}`}
                                required
                                placeholder="Enter your full name"
                            />
                            {errors.fullname && (
                                <p className="text-xs text-red-600 mt-1">{errors.fullname}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label className={labelClasses}>Username</label>
                                <span className="text-xs text-gray-500">3-16 chars, letters, numbers, _ or -</span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">@</span>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.user.username}
                                    onChange={handleInputChange}
                                    className={`${inputClasses} pl-8 ${errors.username ? 'ring-red-300 border-red-300' : ''}`}
                                    required
                                    placeholder="Choose a unique username"
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs text-red-600 mt-1">{errors.username}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label className={labelClasses}>Email Address</label>
                                <span className="text-xs text-gray-500">Verification required</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.user.email}
                                onChange={handleInputChange}
                                className={`${inputClasses} ${errors.email ? 'ring-red-300 border-red-300' : ''}`}
                                required
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label className={labelClasses}>Password</label>
                                <span className="text-xs text-gray-500">8+ chars with A-Z, a-z, 0-9, symbols</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.user.password}
                                    onChange={handleInputChange}
                                    className={`${inputClasses} pr-10 ${errors.password ? 'ring-red-300 border-red-300' : ''}`}
                                    required
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label className={labelClasses}>Confirm Password</label>
                                <span className="text-xs text-gray-500">Must match password</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.user.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`${inputClasses} pr-10 ${errors.confirmPassword ? 'ring-red-300 border-red-300' : ''}`}
                                    required
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className={labelClasses}>
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Date of Birth
                                    </div>
                                </label>
                                <div className="flex items-center gap-2">
                                    <VisibilityToggle
                                        value={formData.profile.dateOfBirthVisibility}
                                        onChange={(value: PrivacyLevel) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                profile: {
                                                    ...prev.profile,
                                                    dateOfBirthVisibility: value
                                                }
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.profile.dateOfBirth}
                                onChange={handleInputChange}
                                className={inputClasses}
                                required
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <p className="text-xs text-gray-500">You must be at least 13 years old</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className={labelClasses}>
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Gender
                                    </div>
                                </label>
                                <div className="flex items-center gap-2">
                                    <VisibilityToggle
                                        value={formData.profile.genderVisibility}
                                        onChange={(value: PrivacyLevel) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                profile: {
                                                    ...prev.profile,
                                                    genderVisibility: value
                                                }
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <select
                                name="gender"
                                value={formData.profile.gender}
                                onChange={handleInputChange}
                                className={inputClasses}
                                required
                            >
                                <option value="">Select your gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className={labelClasses}>
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Bio
                                    </div>
                                </label>
                            </div>
                            <textarea
                                name="bio"
                                value={formData.profile.bio}
                                onChange={handleInputChange}
                                className={inputClasses}
                                rows={3}
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className={labelClasses}>
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Location
                                    </div>
                                </label>
                                <div className="flex items-center gap-2">
                                    <VisibilityToggle
                                        value={formData.profile.locationVisibility}
                                        onChange={(value: PrivacyLevel) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                profile: {
                                                    ...prev.profile,
                                                    locationVisibility: value
                                                }
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <LocationSearch
                                value={formData.profile.location}
                                onChange={(location) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        profile: {
                                            ...prev.profile,
                                            location
                                        }
                                    }));
                                }}
                                className={inputClasses}
                                placeholder="Search for your location..."
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

            {/* Main Content */}
            <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-xl space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome to SealChat
                        </h1>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {step === 1 ? 'Create your account' : 'Complete your profile'}
                        </h2>
                        <p className="text-lg text-gray-600">
                            {step === 1 ? 'Join our community in just a few steps' : 'Tell us a bit about yourself'}
                        </p>
                    </div>

                    {renderProgressBar()}
                    
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-indigo-100">
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            {renderStep()}
                            
                            <div className="space-y-4 pt-6">
                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!isStepValid() || isLoading}
                                        className={`flex-1 text-white py-3 px-6 rounded-lg font-semibold shadow-sm transition-all duration-200 flex items-center justify-center ${
                                            !isStepValid() || isLoading
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : step === 2 
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {step === 2 ? 'Setting up your profile...' : 'Creating your account...'}
                                            </>
                                        ) : (
                                            <>
                                                {step === 2 ? 'Complete Profile Setup' : 'Create Account'}
                                            </>
                                        )}
                                    </button>
                                </div>
                                {step === 1 && (
                                    <div className="text-center">
                                        <Link 
                                            href="/login" 
                                            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Already have an account? Sign in
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {step === 1 && (
                        <div className="text-center text-sm text-gray-500">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Privacy Policy
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            
        </div>
    );
}