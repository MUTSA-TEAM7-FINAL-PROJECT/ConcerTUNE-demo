import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/auth";
import { FaPaperPlane, FaCheckCircle, FaLock } from 'react-icons/fa';

const INITIAL_TIMER = 180; 

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "", 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [isVerificationRequested, setIsVerificationRequested] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timer, setTimer] = useState(INITIAL_TIMER);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      setIsTimerRunning(false);
      setError("인증 시간이 만료되었습니다. 인증번호를 재전송해 주세요.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);
  
  const handleRequestVerification = async () => {
    setError(null);
    const email = formData.email;

    if (!email) {
      setError("이메일 주소를 먼저 입력해 주세요.");
      return;
    }
    
    if (!isValidEmail(email)) {
        setError("유효한 이메일 주소 형식이 아닙니다.");
        return;
    }
    
    setIsRequesting(true);
    try {
      await authService.requestEmailVerification(email);
      
      setIsVerificationRequested(true);
      setIsEmailVerified(false); 
      setTimer(INITIAL_TIMER);
      setIsTimerRunning(true);       
    } catch (err) {
      setError(err.message || "인증번호 요청에 실패했습니다.");
      setIsVerificationRequested(false);
      setIsTimerRunning(false);
      setTimer(INITIAL_TIMER);
    } finally {
      setIsRequesting(false);
    }
  };
  
  const handleConfirmVerification = async () => {
    setError(null);
    if (!formData.verificationCode || formData.verificationCode.length !== 6) { 
        setError("유효한 인증번호를 입력해 주세요.");
        return;
    }
    
    setIsRequesting(true);
    try {
      await authService.confirmEmailVerification(formData.email, formData.verificationCode);
      
      setIsEmailVerified(true);
      setIsTimerRunning(false);
      setError(null);
      
    } catch (err) {
      setError(err.message || "인증번호 확인에 실패했습니다.");
    } finally {
      setIsRequesting(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isEmailVerified) {
        setError("회원가입을 계속하려면 이메일 인증을 완료해야 합니다.");
        return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (formData.password.length < 10) {
      setError("비밀번호는 최소 10자리 이상이어야 합니다.");
      return;
    }
    if (formData.username.length < 3) {
      setError("사용자명은 최소 3글자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      alert("회원가입이 완료되었습니다.");
      navigate("/login"); 
      
    } catch (err) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6"> 
      <div className="w-full max-w-lg p-10 space-y-10 bg-white shadow-2xl rounded-2xl border border-gray-100 transform transition duration-500 hover:shadow-3xl">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight mb-12">
          새 계정 만들기
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-2">
              사용자명 (3자 이상)
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150"
              placeholder="사용할 이름"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
              이메일 주소
            </label>
            <div className="flex space-x-2">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEmailVerified || isVerificationRequested} 
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="name@example.com"
                  required
                />
                
                <button
                    type="button"
                    onClick={handleRequestVerification}
                    disabled={isEmailVerified || isRequesting || isTimerRunning}
                    className={`flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition duration-150 whitespace-nowrap ${
                        isEmailVerified
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400'
                    }`}
                >
                    {isEmailVerified ? (
                        <>
                            <FaCheckCircle className="mr-2" /> 인증 완료
                        </>
                    ) : isRequesting ? (
                        "전송 중..."
                    ) : (
                        <>
                            <FaPaperPlane className="mr-2" /> 인증 요청
                        </>
                    )}
                </button>
            </div>
          </div>
          
        <div 
          className={`
              transition-all duration-500 ease-in-out 
              overflow-hidden 
              // 인증 요청되었고 아직 인증이 안 되었을 때만 높이를 확장합니다.
              ${isVerificationRequested && !isEmailVerified ? 'max-h-96 opacity-100 pt-2' : 'max-h-0 opacity-0 pt-0'}
              space-y-2
          `}
        >
          <div className="flex items-center justify-between">
              <label htmlFor="verificationCode" className="block text-lg font-medium text-gray-700">
                  인증번호 입력
              </label>
              {isTimerRunning && (
                  <span className="text-red-500 font-semibold text-md">
                      {formatTime(timer)}
                  </span>
              )}
          </div>
          <div className="flex space-x-2">
              <input
                  id="verificationCode"
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150"
                  placeholder="인증번호 6자리"
                  maxLength="6"
                  required
              />
              <button
                  type="button"
                  onClick={handleConfirmVerification}
                  disabled={isRequesting || !formData.verificationCode}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition duration-150 whitespace-nowrap disabled:bg-gray-400"
              >
                  {isRequesting ? "확인 중..." : "확인"}
              </button>
          </div>
        </div>
          
          <div>
            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
              비밀번호 (10자 이상)
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150"
              placeholder="비밀번호"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150"
              placeholder="비밀번호 재확인"
              required
            />
          </div>

          {error && (
            <div className="text-base text-center bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}
          
+          <button
            type="submit"
            disabled={loading || !isEmailVerified} 
            className="group relative w-full flex justify-center py-3 px-5 border border-transparent text-xl font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isEmailVerified ? (
                loading ? "가입 처리 중..." : "회원가입"
            ) : (
                <span className="flex items-center">
                    <FaLock className="mr-2"/> 이메일을 인증해주세요
                </span>
            )}
          </button>
        </form>

        <p className="text-lg text-center text-gray-600 pt-4">
          이미 계정이 있으신가요?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;