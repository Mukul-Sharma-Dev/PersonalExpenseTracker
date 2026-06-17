import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Lightfall from '../components/Lightfall/Lightfall';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import toast from 'react-hot-toast';
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const FEATURES = [
  {
    title: "Monthly Budget Tracking",
    desc: "Stay on top of your financial goals with powerful tracking tools that monitor your monthly budget dynamically.",
    image: "/images/feature_budget_tracking_1781673058415.png"
  },
  {
    title: "Custom Budget Category Creation",
    desc: "Personalize your spending habits by creating custom categories tailored to your unique financial lifestyle.",
    image: "/images/feature_category_creation_1781673084163.png"
  },
  {
    title: "Budget Analysis",
    desc: "Gain deep insights into your expenses with advanced analytical tools and comprehensive breakdowns.",
    image: "/images/feature_budget_analysis_1781673106921.png"
  },
  {
    title: "Downloadable Reports",
    desc: "Export your financial data effortlessly. Generate beautiful, detailed reports ready to download anytime.",
    image: "/images/feature_reports_1781673151202.png"
  },
  {
    title: "Profile Creation",
    desc: "Set up your secure personal profile to keep your financial journey private, synced, and always accessible.",
    image: "/images/feature_profile_1781673179285.png"
  }
];

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "Entrepreneur",
    image: "/images/testimonial_1_1781673204468.png",
    text: "This app revolutionized how I manage my startup expenses. The custom categories are an absolute lifesaver!",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "Freelance Designer",
    image: "/images/testimonial_2_1781673230423.png",
    text: "Beautiful interface and the downloadable reports make tax season a breeze. Highly recommended.",
    rating: 5
  },
  {
    name: "Rahul Desai",
    role: "Software Engineer",
    image: "/images/testimonial_3_1781673253500.png",
    text: "The budget analysis is spot on. I finally feel in control of my monthly savings.",
    rating: 4
  },
  {
    name: "Meera Gupta",
    role: "Business Executive",
    image: "/images/testimonial_4_1781674765057.png",
    text: "Elegant and fast. The financial insights help me optimize my personal wealth beautifully.",
    rating: 5
  },
  {
    name: "Vikram Singh",
    role: "Software Developer",
    image: "/images/testimonial_5_1781674779994.png",
    text: "As a developer, I appreciate the clean UI and seamless performance. Top notch tool!",
    rating: 5
  },
  {
    name: "Rohan Kapoor",
    role: "Entrepreneur",
    image: "/images/testimonial_6_1781674802735.png",
    text: "Tracking my daily expenses has never looked this good. I absolutely love the dark mode.",
    rating: 4
  }
];

export default function LandingPage() {
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Assuming API runs on port 8000 on localhost, or relative path if proxied
      await axios.post('http://localhost:8000/contact', contactData);
      toast.success('Message sent successfully! We will get back to you soon.', { style: { background: '#f8fafc', color: '#2D1B15', border: '1px solid #F97316' } });
      setContactData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      
      {/* Hero Section */}
      <div className="relative w-full h-screen overflow-hidden bg-black">
        <Lightfall 
          colors={['#8B5CF6', '#6366F1', '#A78BFA']}
          backgroundColor="#0F172A"
          speed={0.8}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none bg-gradient-to-b from-black/60 to-transparent px-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wide text-center uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-tight">
            Personal<br/>Expense<br/>Tracker
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-2xl text-primary-300 uppercase tracking-widest font-bold text-center">
            Take control of your finances
          </p>
          <div className="mt-12 pointer-events-auto">
            <Link to="/login" className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-primary-400">
              Get Started Now
            </Link>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-6xl font-bold mb-8 text-slate-900 dark:text-white tracking-widest uppercase">About Us</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-violet-500 mx-auto mb-10 rounded-full"></div>
        <p className="text-lg md:text-2xl leading-relaxed text-slate-700 dark:text-slate-300 italic">
          Personal Expense Tracker was built with a simple mission: to empower individuals to take absolute control of their financial destiny. We combine cutting-edge technology with elegant, user-centric design to transform the tedious task of budgeting into a beautiful and intuitive experience. Whether you're tracking daily expenses or analyzing complex financial reports, our platform is designed to support your journey to financial freedom.
        </p>
      </div>

      {/* Features Section */}
      <div className="w-full flex flex-col items-center py-24 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 relative overflow-hidden">
        
        <h2 className="text-4xl md:text-5xl font-bold mb-20 text-slate-900 dark:text-white uppercase tracking-widest border-b-4 border-primary-500 pb-4 relative z-20 text-center">
          Core Features
        </h2>
        
        <div className="relative w-full max-w-7xl mx-auto flex flex-col gap-32 px-4">
          {/* Background Sinusoidal Roadmap Thread */}
          <div className="absolute inset-0 z-0 hidden lg:flex justify-center pointer-events-none">
            <svg className="w-full h-[110%] -mt-[5%]" preserveAspectRatio="none" viewBox="0 0 100 1000">
              <path 
                d="M 50 0 C 80 150, 80 250, 50 400 C 20 550, 20 650, 50 800 C 80 950, 80 1000, 50 1000" 
                stroke="url(#roadmapGradient)" 
                strokeWidth="4" 
                fill="none" 
                vectorEffect="non-scaling-stroke" 
                strokeDasharray="16 16" 
                className="opacity-70"
              />
              <defs>
                <linearGradient id="roadmapGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {FEATURES.map((feature, index) => {
            const isReverse = index % 2 !== 0;
            const alignClass = isReverse ? 'lg:ml-auto lg:mr-0' : 'lg:ml-0 lg:mr-auto';
            return (
              <div key={index} className={`flex flex-col md:flex-row ${isReverse ? 'md:flex-row-reverse' : ''} w-full lg:w-[calc(100%-180px)] ${alignClass} min-h-[300px] shadow-2xl rounded-2xl overflow-hidden relative z-10 bg-white dark:bg-slate-800 transform hover:-translate-y-2 transition-all duration-500`}>
              
              {/* Feature Name Panel - 30% */}
              <div className="w-full md:w-[30%] bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-r border-gray-200 dark:border-slate-700 flex items-center justify-center p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 dark:bg-primary-900/30 rounded-full blur-3xl opacity-40 -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-200 dark:bg-violet-900/30 rounded-full blur-3xl opacity-40 -ml-10 -mb-10 transition-transform group-hover:scale-150 duration-700"></div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-slate-900 dark:text-white relative z-10 leading-snug drop-shadow-sm">
                  {feature.title}
                </h3>
              </div>

              {/* Feature Image & Description - 70% */}
              <div 
                className="w-full md:w-[70%] bg-cover bg-center relative flex items-center p-6 md:p-12 min-h-[250px]"
                style={{ backgroundImage: `url(${feature.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 md:to-transparent"></div>
                <div className="relative z-10 max-w-xl">
                  <p className="text-lg md:text-xl lg:text-3xl text-white font-light leading-relaxed border-l-4 border-primary-500 pl-4 md:pl-6 drop-shadow-md">
                    {feature.desc}
                  </p>
                </div>
              </div>

            </div>
          );
        })}
        </div>
      </div>

      {/* Testimonials 3D Carousel Section */}
      <div className="py-24 px-4 relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 uppercase tracking-widest text-slate-900 dark:text-white">
            What Our Users Say
          </h2>
          
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            coverflowEffect={{
              rotate: 40,
              stretch: 0,
              depth: 150,
              modifier: 1.2,
              slideShadows: true,
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            modules={[EffectCoverflow, Pagination, Autoplay]}
            className="w-full max-w-5xl py-12"
          >
            {TESTIMONIALS.map((t, idx) => (
              <SwiperSlide key={idx} className="w-[300px] sm:w-[380px] bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-[2rem] shadow-xl border-t-8 border-primary-500 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <img src={t.image} alt={t.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg border-4 border-primary-100 dark:border-primary-900 mb-6" />
                  <div className="flex text-primary-500 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-7 h-7 ${i < t.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-lg sm:text-xl italic text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">"{t.text}"</p>
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <span className="text-xs sm:text-sm text-primary-500 font-bold uppercase tracking-widest mt-1">{t.role}</span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Connect With Us Form */}
      <div className="py-24 px-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
         <div className="max-w-3xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-slate-900 dark:text-white uppercase tracking-widest">Connect With Us</h2>
             <p className="text-center text-slate-500 dark:text-slate-400 mb-12 text-lg italic">We'd love to hear from you. Send us a message!</p>
             
             <form onSubmit={handleContactSubmit} className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-10 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2 uppercase tracking-wide">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={contactData.name}
                      onChange={e => setContactData({...contactData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:bg-slate-800 dark:text-white outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={contactData.email}
                      onChange={e => setContactData({...contactData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:bg-slate-800 dark:text-white outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2 uppercase tracking-wide">Message</label>
                  <textarea 
                    required 
                    rows="4"
                    value={contactData.message}
                    onChange={e => setContactData({...contactData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:bg-slate-800 dark:text-white outline-none transition-all resize-none"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 text-white font-bold text-lg rounded-xl shadow-md transition-all duration-300 uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
             </form>
         </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 border-t-8 border-primary-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase mb-2">Personal Expense Tracker</h3>
            <p className="text-primary-300 font-light italic">Your journey to financial freedom begins here.</p>
          </div>
          <div className="text-lg font-light tracking-wider bg-black/30 px-6 py-3 rounded-full border border-white/10 shadow-inner">
            Made with love ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
}
