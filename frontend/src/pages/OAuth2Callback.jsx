import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");
    console.log("OAuth2 Callback Params:", { token, refreshToken, error });
    if (error) {
      navigate("/login");
      return;
    }

    if (token && refreshToken) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);

      try {
        const base64UrlPayload = token.split(".")[1];
        const decodedPayloadString = decodeBase64UrlSafe(base64UrlPayload);
        const payload = JSON.parse(decodedPayloadString);
        
        const user = {
          id: payload.id,
          email: payload.email,
          username: payload.username,
          profileImageUrl: payload.profileImageUrl || null,
          role: payload.role,
          bio : payload.bio || null,
          phoneNumber : payload.phoneNumber || null,
        };

        localStorage.setItem("user", JSON.stringify(user));    

        navigate("/");
      } catch (err) {
                console.log(err);

        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-sky-500 to-cyan-400">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-medium">Logging you in...</p>
      </div>
    </div>
  );
};

const decodeBase64UrlSafe = (base64UrlString) => {
    let standardBase64 = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');
    while (standardBase64.length % 4) {
        standardBase64 += '=';
    }

    const binaryString = atob(standardBase64);
    
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
};
export default OAuth2Callback;