import { FaCapsules, FaRobot, FaUserMd, FaHandshake, FaDonate } from "react-icons/fa";
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';

export default function Services() {
  const services = [
    {
      icon: <FaCapsules size={28} />,
      title: "Affordable Medicines",
      desc: "Access quality near-expiry medicines at huge discounts, making healthcare affordable for all."
    },
    {
      icon: <FaRobot size={28} />,
      title: "AI-Powered Suggestions",
      desc: "Get instant alternative medicines and treatment suggestions with the power of AI."
    },
    {
      icon: <FaUserMd size={28} />,
      title: "Doctor Consultations",
      desc: "Easily connect with verified doctors for guidance about your prescriptions and treatments."
    },
    {
      icon: <FaHandshake size={28} />,
      title: "Verified Seller Listings",
      desc: "Buy only from trusted, verified sellers who maintain product safety and quality standards."
    },
    {
      icon: <FaDonate size={28} />,
      title: "NGO Donations",
      desc: "Sellers can donate unsold medicines to partnered NGOs to create social impact and reduce waste."
    }
  ];

  return (
    <section className="flex flex-col items-center justify-center min-h-screen py-24 px-6 bg-[#101820]/80 relative">
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
      
      <div className="relative mb-24 flex items-center justify-center w-full max-w-2xl mx-auto">
        {/* <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-lg" style={{ zIndex: 1 }}></div> */}
        <h2 className="relative text-5xl font-extrabold text-center text-[#00FFB2] tracking-tight font-poppins px-8 py-4" style={{ zIndex: 2 }}>
          Our Services
        </h2>
      </div>
      <br></br>
      <div className="flex flex-col w-full max-w-5xl gap-10 items-center">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-lg p-6 gap-6 w-full hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#00FFB2] flex items-center justify-center">
              <div className="text-black">{service.icon}</div>
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold text-2xl text-[#00FFB2] font-poppins">{service.title}</h4>
              <p className="text-lg text-white/90 font-roboto leading-relaxed">
                {service.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
