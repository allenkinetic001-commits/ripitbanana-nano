import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const totalSteps = 7;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ has_onboarded: true })
          .eq('id', user.id);
      }
      navigate('/');
    }
  };

  const stepsContent = [
    {
      title: 'Welcome to RipIt',
      titleImage: '/onboarding-title-1.png',
      textImage: '/onboarding-text.png',
      description: 'The premier platform for artisan challenges. Get ready to prove yourself.',
      icon: '🔥',
      image: '/onboarding-step1.png'
    },
    {
      title: 'Built for Survivors',
      titleImage: '/onboarding-title-2.png',
      textImage: '/onboarding-text-2.png',
      description: 'Only the best make it through. Track your survival history over time.',
      icon: '💀',
      image: '/onboarding-step2.png?v=4'
    },
    {
      title: 'Set Your Profile',
      titleImage: '/onboarding-title-3.png',
      textImage: '/onboarding-text-3.png',
      description: 'Customize your artisan presence. Show them who you truly are.',
      icon: '🎭',
      image: '/onboarding-step3.png?v=3'
    },
    {
      title: 'Find Your Tribe',
      titleImage: '/onboarding-title-4.png',
      textImage: '/onboarding-text-4.png',
      description: 'Follow other survivors and build your network. Note: only survivors can be followed.',
      icon: '🤝',
      image: '/onboarding-step4.png'
    },
    {
      title: 'Earn Your Status',
      titleImage: '/onboarding-title-5.png',
      textImage: '/onboarding-text-5.png',
      description: 'Unlock exclusive achievements as you overcome impossible odds.',
      icon: '🏆',
      image: '/onboarding-step5.png'
    },
    {
      title: 'Dominate the Leaderboard',
      titleImage: '/onboarding-title-6.png',
      textImage: '/onboarding-text-6.png',
      description: 'Rise to the top and let the community witness your legendary runs.',
      icon: '👑',
      image: '/onboarding-step6.png'
    },
    {
      title: 'Are You Ready?',
      titleImage: '/onboarding-title-7.png',
      textImage: '/onboarding-text-7.png',
      description: 'The challenges wait for no one. Step up and rip it.',
      icon: '🚀',
      image: '/onboarding-step7.png'
    }
  ];

  const handleSkip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ has_onboarded: true })
        .eq('id', user.id);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-200 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-100 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center mt-8">
        
        {/* Skip Button */}
        <button 
          onClick={handleSkip}
          className="absolute top-[-2rem] right-0 z-50 p-2 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <img src="/onboarding-skip.png" alt="Skip" className="h-6 w-auto mix-blend-multiply drop-shadow-sm" />
        </button>

        {/* Dynamic Content */}
        <div className="min-h-[40rem] flex flex-col items-center justify-center text-center space-y-4 w-full px-4" key={step}>
          {!stepsContent[step - 1].image && (
            <div className="text-8xl animate-bounce">
              {stepsContent[step - 1].icon}
            </div>
          )}
          {stepsContent[step - 1].titleImage ? (
            <img 
              src={stepsContent[step - 1].titleImage} 
              alt={stepsContent[step - 1].title} 
              className="h-40 w-auto object-contain mx-auto"
            />
          ) : (
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
              {stepsContent[step - 1].title}
            </h1>
          )}
          {stepsContent[step - 1].image ? (
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              <img 
                src={stepsContent[step - 1].image} 
                alt=""
                className="h-[32rem] w-auto object-contain drop-shadow-2xl animate-in zoom-in slide-in-from-bottom duration-700 mt-2 scale-110"
              />
            </div>
          ) : (
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-sm mt-4">
              {stepsContent[step - 1].description}
            </p>
          )}
        </div>

        {/* Text Image */}
        {stepsContent[step - 1].textImage && (
          <div className="flex justify-center w-full px-2 mt-8">
            <img 
              src={stepsContent[step - 1].textImage} 
              alt="Description" 
              className={`${step === 2 ? 'h-12' : step === 4 ? 'h-36' : step === 5 ? 'h-28' : step === 6 ? 'h-28' : step === 7 ? 'h-24' : step === 1 ? 'h-48' : 'h-[68px]'} w-auto object-contain mx-auto drop-shadow-md animate-in fade-in zoom-in duration-500`}
            />
          </div>
        )}

        {/* Progress Section */}
        <div className="w-full mt-8 flex flex-row items-center justify-between px-2">
          {/* Progress Dots */}
          <div className="flex items-center space-x-3 ml-12">
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i} 
                className={`transition-all duration-300 rounded-full ${
                  step === i + 1 
                    ? 'w-8 h-2 bg-red-600' 
                    : step > i + 1
                      ? 'w-2 h-2 bg-red-300'
                      : 'w-2 h-2 bg-zinc-200'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
          >
            <img 
              src="/onboarding-continue.png" 
              alt={step < totalSteps ? "Continue" : "Get Started"} 
              className="h-32 w-auto object-contain"
            />
          </button>
        </div>

      </div>
    </div>
  );
}
