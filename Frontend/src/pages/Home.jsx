import { FaCapsules, FaRobot, FaDonate, FaShieldAlt } from 'react-icons/fa';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';



const StyledButton = styled(motion.a)`
  background: #00FFAB;
  color: #22223b;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  cursor: pointer;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  font-size: 1.1rem;
  margin-left: 1rem;
  box-shadow: 0 2px 8px 0 rgba(0,255,171,0.08);
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #00CC89;
    color: #fff;
  }
`;


export default function Home() {
    return (
        <>
            <Navbar />
            <section className="flex flex-col md:flex-row items-center justify-center min-h-screen gap-16 px-6 md:px-24 py-16 relative bg-[#101820] pt-24">
                {/* Star Background */}
                <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
                    <Canvas
                        camera={{
                            position: [-2, 2, 4],
                            fov: 70,
                            near: 0.001,
                            far: 1000
                        }}
                    >
                        <Background />
                    </Canvas>
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backdropFilter: 'blur(8px)' }}
                    />
                </div>
                <div className="flex-1 flex flex-col justify-center items-start max-w-xl z-10 space-y-8">
                    <div className="mb-4">
                        <span className="inline-block text-2xl font-bold text-emerald-400 tracking-widest mb-2 ml-2">
                            MediBridge
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                        Affordable Medicines,<br /> Trusted Platform
                    </h1>

                    <p className="text-lg text-gray-300 mt-2 mb-8 leading-relaxed">
                        MediBridge connects you with safe, verified near-expiry medicines at up to <span className="text-emerald-400 font-bold">90% off</span>.  Our AI assistant helps you find the right medicine and affordable healthcare solutions instantly.
                    </p>
                    <br></br>
                    <div className="flex gap-4">
                        <StyledButton
                            href="/services"
                        >
                            Explore Services
                        </StyledButton>
                        <StyledButton
                            href="/about"
                        >
                            About Us
                        </StyledButton>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative w-full md:w-auto min-h-[400px]">
                    <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 animate-float-slow z-10
                                bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/10">
                        <FaCapsules className="text-7xl text-emerald-400 drop-shadow-xl" />
                    </div>
                  
                    <div className="absolute left-1/4 top-2/3 -translate-x-1/2 -translate-y-1/2 animate-float z-20
                                bg-white/5 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/10">
                        <FaRobot className="text-6xl text-emerald-400 drop-shadow-xl" />
                    </div>
                    <div className="absolute left-3/4 top-2/3 -translate-x-1/2 -translate-y-1/2 animate-float-reverse z-20
                                bg-white/5 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/10">
                        <FaDonate className="text-6xl text-emerald-400 drop-shadow-xl" />
                    </div>
                    <div className="absolute left-1/2 top-3/4 -translate-x-1/2 -translate-y-1/2 animate-float-fast z-0
                                bg-white/5 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/10">
                        <FaShieldAlt className="text-5xl text-emerald-400 drop-shadow-xl" />
                    </div>
                  
                    <div className="relative flex md:hidden gap-4 mt-8">
                        <FaCapsules className="text-4xl text-emerald-400 bg-white/10 rounded-2xl p-2" />
                        <FaRobot className="text-4xl text-emerald-400 bg-white/10 rounded-2xl p-2" />
                        <FaDonate className="text-4xl text-emerald-400 bg-white/10 rounded-2xl p-2" />
                        <FaShieldAlt className="text-4xl text-emerald-400 bg-white/10 rounded-2xl p-2" />
                    </div>
                </div>
              
                <style>{`
                      @keyframes float {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-25px); }
                        100% { transform: translateY(0); }
                    }
                    @keyframes float-reverse {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(25px); }
                        100% { transform: translateY(0); }
                    }
                    .animate-float { animation: float 4s ease-in-out infinite; }
                    .animate-float-slow { animation: float 6s ease-in-out infinite; }
                    .animate-float-fast { animation: float 2.5s ease-in-out infinite; }
                    .animate-float-reverse { animation: float-reverse 4s ease-in-out infinite; }
                `}</style>
            </section>
        </>
    );
}
