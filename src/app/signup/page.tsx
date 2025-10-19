'use client';
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
    username: string;
    email: string;
    fullname: string;
    password: string;
    confirmPassword: string;
}

interface ProfileData {
    dateOfBirth: string;
    gender: string;
    profilePicture: File | null;
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
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const [step, setStep] = useState(initialStep);
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
            gender: '',
            profilePicture: null,
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
            case 'password':
                return !PASSWORD_REGEX.test(value)
                    ? 'Password must be at least 8 characters with mixed case, numbers & symbols'
                    : undefined;
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                profilePicture: file
            }
        }));
    };

    const validateStep1 = () => {
        const newErrors = {
            fullname: validateField('fullname', formData.user.fullname),
            username: validateField('username', formData.user.username),
            email: validateField('email', formData.user.email),
            password: validateField('password', formData.user.password),
            confirmPassword: validateField('confirmPassword', formData.user.confirmPassword)
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== undefined);
    };

    const validateStep2 = () => {
        const newErrors = {
            dateOfBirth: validateField('dateOfBirth', formData.profile.dateOfBirth),
            gender: validateField('gender', formData.profile.gender)
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== undefined);
    };

    const handleSubmit = async () => {
        if (step === 1) {
            try {
                setIsLoading(true);
                // Make API call to create user account
                // const response = await fetch('/api/auth/signup', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({
                //         username: formData.user.username,
                //         email: formData.user.email,
                //         password: formData.user.password,
                //         fullname: formData.user.fullname
                //     })
                // });
                // const data = await response.json();
                // if (!response.ok) throw new Error(data.message);

                // Simulate API call for now
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // After successful user creation, move to profile setup
                setErrors({});
                setStep(2);
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    submit: error instanceof Error ? error.message : 'An error occurred'
                }));
            } finally {
                setIsLoading(false);
            }
        } else if (step === 2) {
            try {
                setIsLoading(true);
                // Make API call to save profile information
                // const response = await fetch('/api/profile/create', {
                //     method: 'POST',
                //     headers: { 
                //         'Content-Type': 'application/json',
                //         'Authorization': `Bearer ${localStorage.getItem('token')}` // If using token auth
                //     },
                //     body: JSON.stringify({
                //         userId: userId, // Use the userId prop for step 2
                //         dateOfBirth: formData.profile.dateOfBirth,
                //         gender: formData.profile.gender
                //     })
                // });
                // const data = await response.json();
                // if (!response.ok) throw new Error(data.message);

                // If profile picture exists, upload it
                if (formData.profile.profilePicture) {
                    // const formData = new FormData();
                    // formData.append('file', formData.profile.profilePicture);
                    // await fetch('/api/profile/upload-photo', {
                    //     method: 'POST',
                    //     headers: {
                    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
                    //     },
                    //     body: formData
                    // });
                }

                // Simulate API call for now
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Redirect to home page after complete signup
                router.push('/home');
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    submit: error instanceof Error ? error.message : 'An error occurred'
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
                formData.profile.gender
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
                            <input
                                type="password"
                                name="password"
                                value={formData.user.password}
                                onChange={handleInputChange}
                                className={`${inputClasses} ${errors.password ? 'ring-red-300 border-red-300' : ''}`}
                                required
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label className={labelClasses}>Confirm Password</label>
                                <span className="text-xs text-gray-500">Must match password</span>
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.user.confirmPassword}
                                onChange={handleInputChange}
                                className={`${inputClasses} ${errors.confirmPassword ? 'ring-red-300 border-red-300' : ''}`}
                                required
                                placeholder="••••••••"
                            />
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
                            <label className={labelClasses}>Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.profile.dateOfBirth}
                                onChange={handleInputChange}
                                className={inputClasses}
                                required
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <p className="text-xs text-gray-500">You must be at least 13 years old to use this service</p>
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>Gender</label>
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
                            <label className={labelClasses}>Profile Picture (Optional)</label>
                            <input
                                type="file"
                                name="profilePicture"
                                onChange={handleFileChange}
                                className={inputClasses}
                                accept="image/*"
                            />
                            <p className="text-xs text-gray-500">You can always update this later from your profile</p>
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
                                <div className="flex space-x-4">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(step - 1)}
                                            className="flex-1 px-6 py-3 text-indigo-600 bg-indigo-50 rounded-lg font-semibold hover:bg-indigo-100 transition-all duration-200 flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back
                                        </button>
                                    )}
                                    
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