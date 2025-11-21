import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import authService from "../services/auth";
import { FaEnvelope, FaPaperPlane, FaKey, FaExclamationTriangle, FaLockOpen } from 'react-icons/fa'; 

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const PasswordResetPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const token = searchParams.get("token");
    const isResetMode = !!token; 

    const [email, setEmail] = useState("");
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRequestedOrSuccess, setIsRequestedOrSuccess] = useState(false); 

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError("이메일 주소를 입력해 주세요.");
            return;
        }
        if (!isValidEmail(email)) {
            setError("유효한 이메일 주소 형식이 아닙니다.");
            return;
        }

        setLoading(true);

        try {
            await authService.requestPasswordReset(email);
            setIsRequestedOrSuccess(true);
            setError(null);
        } catch (err) {
            setError(err.message || "재설정 요청에 실패했습니다.");
            setIsRequestedOrSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (passwordData.newPassword.length < 10) {
            setError("새 비밀번호는 최소 10자리 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, passwordData.newPassword);
            setIsRequestedOrSuccess(true); 
            setError(null);
        } catch (err) {
            setError(err.message || "비밀번호 재설정에 실패했습니다. 토큰이 유효하지 않을 수 있습니다.");
        } finally {
            setLoading(false);
        }
    };

    const renderSuccessScreen = () => (
        <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200 space-y-4">
            <FaKey className="mx-auto text-5xl text-green-600" />
            <h3 className="text-xl font-bold text-green-800">재설정 완료!</h3>
            <p className="text-gray-700">
                비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해 주세요.
            </p>
            <button
                onClick={() => navigate("/login")}
                className="w-full mt-4 py-3 px-5 border border-transparent text-xl font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150"
            >
                로그인 하러가기
            </button>
        </div>
    );

    const renderRequestSuccessScreen = () => (
        <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-200 space-y-4">
            <FaEnvelope className="mx-auto text-5xl text-indigo-600" />
            <h3 className="text-xl font-bold text-indigo-800">이메일 전송 완료</h3>
            <p className="text-gray-700">
                {email} 주소로 비밀번호 재설정 링크를 보냈습니다.
                이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해 주세요.
            </p>
        </div>
    );


    const renderResetForm = () => (
        <form onSubmit={handleResetSubmit} className="space-y-6">
            <div>
                <label htmlFor="newPassword" className="block text-lg font-medium text-gray-700 mb-2">
                    새 비밀번호 (10자 이상)
                </label>
                <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    disabled={loading}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150 disabled:bg-gray-100"
                    placeholder="새 비밀번호"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700 mb-2">
                    새 비밀번호 확인
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={loading}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150 disabled:bg-gray-100"
                    placeholder="새 비밀번호 재확인"
                    required
                />
            </div>
            
            {error && (
                <div className="text-base text-center bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            )}
            
            <button
                type="submit"
                disabled={loading} 
                className="group relative w-full flex justify-center py-3 px-5 border border-transparent text-xl font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                <FaLockOpen className="mr-3"/> 
                {loading ? "비밀번호 재설정 중..." : "비밀번호 재설정"}
            </button>
        </form>
    );

    // 4. 재설정 요청 폼 (isResetMode = false)
    const renderRequestForm = () => (
        <form onSubmit={handleRequestSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                    계정 이메일 주소
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={loading}
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150 disabled:bg-gray-100"
                    placeholder="name@example.com"
                    required
                />
            </div>

            {error && (
                <div className="text-base text-center bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            )}
            
            <button
                type="submit"
                disabled={loading} 
                className="group relative w-full flex justify-center py-3 px-5 border border-transparent text-xl font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                <FaPaperPlane className="mr-3"/> 
                {loading ? "요청 처리 중..." : "재설정 링크 요청"}
            </button>
        </form>
    );
    
    const renderTokenError = () => (
        <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200 space-y-4">
            <FaExclamationTriangle className="mx-auto text-5xl text-red-600" />
            <h3 className="text-xl font-bold text-red-800">유효하지 않은 토큰</h3>
            <p className="text-gray-700">
                제공된 재설정 토큰이 유효하지 않거나 만료되었습니다. 다시 요청해 주세요.
            </p>
            <Link to="/password-reset" className="text-lg font-semibold text-indigo-600 hover:text-indigo-500 hover:underline block pt-2">
                재설정 요청 페이지로 돌아가기
            </Link>
        </div>
    );
    

    let content;
    let title = "비밀번호 재설정";

    if (isResetMode) {
        if (isRequestedOrSuccess) {
            content = renderSuccessScreen(); 
            title = "비밀번호 재설정 완료";
        } else if (!token && !loading) {
            content = renderTokenError(); 
        } else {
            content = renderResetForm(); 
        }
    } else {
        if (isRequestedOrSuccess) {
            content = renderRequestSuccessScreen(); 
            title = "재설정 링크 전송됨";
        } else {
            content = renderRequestForm(); 
            title = "비밀번호 재설정 요청";
        }
    }


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
            <div className="w-full max-w-lg p-10 space-y-10 bg-white shadow-2xl rounded-2xl border border-gray-100 transform transition duration-500 hover:shadow-3xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 tracking-tight mb-8">
                    {title}
                </h2>
                
                {content}
                
                {(!isResetMode || !isRequestedOrSuccess) && (
                    <p className="text-lg text-center text-gray-600 pt-4">
                        <Link
                            to="/login"
                            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
                        >
                            로그인 페이지로 돌아가기
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default PasswordResetPage;