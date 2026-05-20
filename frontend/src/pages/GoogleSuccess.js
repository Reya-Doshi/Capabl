import { useEffect } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

export default function GoogleSuccess() {

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {

    const token = searchParams.get("token");

    const email = searchParams.get("email");

    const name = searchParams.get("name");

    const type = searchParams.get("type");

    if (!token) {

      navigate("/login");

      return;

    }

    // SAVE TOKEN

    localStorage.setItem(
      "token",
      token
    );

    // SAVE USER

    localStorage.setItem(

      "userInfo",

      JSON.stringify({
        name,
        email,
      })

    );

    // REDIRECT BASED ON USER STATUS

    if (type === "dashboard") {

      navigate("/dashboard");

    } else {

      navigate("/onboarding");

    }

  }, []);

  return (

    <div className="min-h-screen flex items-center justify-center text-xl font-semibold">

      Logging you in...

    </div>

  );
}