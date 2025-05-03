import { FaRobot, FaHandHoldingUsd, FaTags, FaUserMd, FaStore } from 'react-icons/fa'; // Added Store icon
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';

export default function About() {
  const aboutPoints = [
    {
      title: 'Trust & Affordability',
      desc: 'MediBridge is your trusted partner for affordable healthcare. We connect you with safe, verified near-expiry medicines at significant discounts, making essential treatments accessible to all.',
      icon: <FaHandHoldingUsd size={32} />,
    },
    {
      title: 'AI-Powered Healthcare',
      desc: 'Leveraging advanced AI, we ensure you get the right medicine and guidance instantly—so you can focus on your health with confidence and peace of mind.',
      icon: <FaRobot size={32} />,
    },
    {
      title: 'Dynamic Discounts',
      desc: 'The closer a medicine is to its expiry, the bigger the discount—so you always get the best deal, transparently.',
      icon: <FaTags size={32} />,
    },
    {
      title: 'Doctor & Medicine Suggestions',
      desc: 'Our AI, powered by Eliza, suggests medicines, finds alternatives, and connects you with trusted doctors for personalized care.',
      icon: <FaUserMd size={32} />,
    },
    {
      title: 'Seller Listings & Donations',
      desc: 'Sellers can list their verified medicines on MediBridge. Users can view trusted sellers, and if a seller wishes, they can donate medicines to partnered NGOs for social impact.',
      icon: <FaStore size={32} />,
    },
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
      {/* Blurred Heading */}
      <br></br>
      <br></br>
      <div className="relative mb-16 flex items-center justify-center w-full max-w-2xl mx-auto">
        {/* <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-lg" style={{ zIndex: 1 }}></div> */}
        <h2 className="relative text-5xl font-extrabold text-center text-[#00FFB2] tracking-tight font-poppins px-8 py-4" style={{ zIndex: 2 }}>
          About MediBridge
        </h2>

      </div>
      <br></br>
      <div className="flex flex-col w-full max-w-4xl gap-10 items-center">
        {aboutPoints.map((point, index) => (
          <div
            key={index}
            className="flex items-center gap-6 w-full bg-white/10 backdrop-blur-md rounded-3xl shadow-lg p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-[#00FFB2] rounded-full text-black shrink-0">
              {point.icon}
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <h4 className="text-2xl text-[#00FFB2] font-bold font-poppins mb-1">
                {point.title}
              </h4>
              <p className="text-md text-gray-300 font-roboto leading-relaxed">
                {point.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section >
  );
}
