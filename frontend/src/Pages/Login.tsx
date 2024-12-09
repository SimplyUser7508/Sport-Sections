import { useRef, useState, useEffect, useContext, FormEvent } from 'react';
import AuthContext from "../Context/Auth";
import axios from '../api/Axios';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const LOGIN_URL = '/auth/login';

const Login = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error("AuthContext must be used within an AuthProvider");
    }
    const { setAuth } = authContext;
    const navigate = useNavigate();

    const emailRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errMsg, setErrMsg] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [email, password]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ email, password }),
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
    
            const accessToken = response?.data?.payload?.accessToken;
            const refreshToken = response?.data?.payload?.refreshToken;
    
            localStorage.setItem('accessToken', accessToken);
            Cookies.set('refreshToken', refreshToken);
    
            setAuth({ email, accessToken });
            setEmail('');
            setPassword('');
            setSuccess(true);
            navigate('/');
        } catch (err: any) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Email or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current?.focus();
        }
    }
    

    return (
        <>
            {success ? (
                <section>
                    <h1>You are logged in!</h1>
                    <br />
                    <p>
                        <Link to="/">Go to Home</Link>
                    </p>
                </section>
            ) : (
                <section>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Sign In</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="text"
                            id="email"
                            ref={emailRef}
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />

                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        <button className='AuthButton'>Sign In</button>
                    </form>
                    <p>
                        Need an Account?<br />
                        <span className="line">
                            <Link to="/auth/register">Sign Up</Link>
                        </span>
                    </p>
                </section>
            )}
        </>
    )
}

export default Login;
