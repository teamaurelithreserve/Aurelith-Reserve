import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ContactPageProps {
  onNavigateHome: () => void;
  onOpenLocations: () => void;
  onOpenHelpCenter?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigateHome,
  onOpenLocations,
  onOpenHelpCenter,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    bestTime: '',
    message: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const scrollToForm = () => {
    const el = document.getElementById('contact-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0B111E] text-slate-800 dark:text-slate-100 animate-fadeIn transition-colors duration-200">
      {/* 1. HERO BANNER */}
      <section className="relative w-full h-[260px] md:h-[320px] overflow-hidden bg-[#162544]">
        <img
          src="https://i.imgur.com/lps2Rvm.jpg"
          alt="Contact Aurelith Reserve Representative"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "https://i.imgur.com/lps2Rvm.png") {
              target.src = "https://i.imgur.com/lps2Rvm.png";
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14233F] via-[#14233F]/70 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Contact Aurelith Reserve
          </h1>
        </div>
      </section>

      {/* 2. BREADCRUMBS */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B111E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
          <button
            onClick={onNavigateHome}
            className="hover:text-[#C8102E] dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>&gt;</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Contact Us</span>
        </div>
      </div>

      {/* 3. HOW MAY WE ASSIST YOU TODAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C2B4C] dark:text-white mb-4">
          How may we assist you today?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-6xl">
          We're always happy to hear from you. Building strong relationships has been part of who we are for over 135 years. Whether you have a question, need assistance, or just want to say hello, give us a call or fill out the form — an Aurelith Reserve representative will get back to you shortly.
        </p>
      </section>

      {/* 4. SIX CARDS GRID */}
      <section className="bg-[#D3E8F6] dark:bg-[#0E1726] py-10 md:py-14 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Contact Us */}
            <div className="bg-white dark:bg-[#152033] rounded-xl p-6 shadow-xs border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white mb-3">Contact Us</h3>
                <p className="text-xs text-[#C8102E] dark:text-red-400 font-medium mb-1.5">
                  Customer Care Center: 855-660-5862
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1.5">
                  24-Hour Automated Telephone Banking System: <span className="font-semibold text-slate-900 dark:text-white">800-588-4925</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  Contact a Specific Employee: <span className="font-semibold text-slate-900 dark:text-white">800-588-7000</span>
                </p>
              </div>
              <div>
                <a
                  href="mailto:customerservice@aurelithreserve.com"
                  className="text-xs text-[#C8102E] dark:text-red-400 font-medium hover:underline inline-block mt-2"
                >
                  customerservice@aurelithreserve.com
                </a>
              </div>
            </div>

            {/* Card 2: Frequently Asked Questions */}
            <div className="bg-white dark:bg-[#152033] rounded-xl p-6 shadow-xs border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white mb-3">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Browse our popular help topics for quick answers to your questions.
                </p>
              </div>
              <div>
                <button
                  onClick={onOpenHelpCenter}
                  className="text-xs text-[#1C2B4C] dark:text-sky-400 font-semibold hover:text-[#C8102E] dark:hover:text-red-400 transition-colors inline-flex items-center cursor-pointer"
                >
                  View FAQs <span className="ml-1 font-bold">&gt;</span>
                </button>
              </div>
            </div>

            {/* Card 3: Fraud Prevention Hub */}
            <div className="bg-white dark:bg-[#152033] rounded-xl p-6 shadow-xs border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white mb-3">Fraud Prevention Hub</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Visit our comprehensive fraud prevention hub with more than 350 articles updated daily.
                </p>
              </div>
              <div>
                <button
                  onClick={onOpenHelpCenter}
                  className="text-xs text-[#1C2B4C] dark:text-sky-400 font-semibold hover:text-[#C8102E] dark:hover:text-red-400 transition-colors inline-flex items-center cursor-pointer"
                >
                  Learn More <span className="ml-1 font-bold">&gt;</span>
                </button>
              </div>
            </div>

            {/* Card 4: Holiday Hours and Branch Closures */}
            <div className="bg-white dark:bg-[#152033] rounded-xl p-6 shadow-xs border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white mb-3">Holiday Hours and Branch Closures</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Looking for more information on branch availability? Start here.
                </p>
              </div>
              <div>
                <button
                  onClick={onOpenLocations}
                  className="text-xs text-[#1C2B4C] dark:text-sky-400 font-semibold hover:text-[#C8102E] dark:hover:text-red-400 transition-colors inline-flex items-center cursor-pointer"
                >
                  See Branch Hours <span className="ml-1 font-bold">&gt;</span>
                </button>
              </div>
            </div>

            {/* Card 5: Send Us a Message */}
            <div className="bg-white dark:bg-[#152033] rounded-xl p-6 shadow-xs border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white mb-3">Send Us a Message</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Have a non-urgent need? Looking for more information with extended hours? Send us an online message.
                </p>
              </div>
              <div>
                <button
                  onClick={scrollToForm}
                  className="text-xs text-[#1C2B4C] dark:text-sky-400 font-semibold hover:text-[#C8102E] dark:hover:text-red-400 transition-colors inline-flex items-center cursor-pointer"
                >
                  Send a Message <span className="ml-1 font-bold">&gt;</span>
                </button>
              </div>
            </div>

            {/* Card 6: Need to Report Fraud? */}
            <div className="bg-white dark:bg-[#152033] rounded-xl p-6 shadow-xs border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white mb-3">Need to Report Fraud?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1.5">
                  Email <span className="font-semibold text-slate-900 dark:text-white">abuse@aurelithreserve.com</span> to let us know.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  We're here to help.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. DEBIT CARD HELP CENTER */}
      <section className="bg-white dark:bg-[#0B111E] py-12 md:py-16 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C2B4C] dark:text-white mb-6">
            Debit Card Help Center
          </h2>

          {/* Activation */}
          <div>
            <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white mb-1">Debit Card Activation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Did you receive a new Debit Card? The day after you receive it, call <span className="font-bold text-slate-900 dark:text-white">844-847-2211</span> to activate it.
            </p>
          </div>

          {/* Lost or Stolen */}
          <div>
            <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white mb-1">Debit Card is Lost or Stolen?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Was your Debit Card lost or stolen? Call us at <span className="font-bold text-slate-900 dark:text-white">855-660-5862</span>, Monday - Friday 8 AM - 7 PM, or after hours at <span className="font-bold text-slate-900 dark:text-white">800-588-4925</span>, to report it. You can also turn it off in your mobile app within a matter of seconds. Learn more about <a href="#controls" onClick={(e) => { e.preventDefault(); alert('Debit Card Controls can be managed in your Mobile Banking app.'); }} className="underline hover:text-[#C8102E] dark:hover:text-red-400">debit card controls</a>.
            </p>
          </div>

          {/* Dispute */}
          <div>
            <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white mb-1">Debit Card Dispute</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Contact us at <span className="font-bold text-slate-900 dark:text-white">855-660-5862</span> to report a fraudulent charge and open a fraud case.
            </p>
          </div>

          {/* Fraud Alert */}
          <div>
            <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white mb-1">Debit Card Fraud Alert</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
              If you received a notification (text or email) about a potential fraudulent charge on your debit card, reply with YES if it was a charge you made, or NO if it was fraudulent. You can also contact our debit card team directly at <span className="font-bold text-slate-900 dark:text-white">866-446-1180</span>.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Remember, these emails or text messages will never ask for your account number or PIN. If you receive a similar message asking for your personal information, do not respond and call us directly at <span className="font-bold text-slate-900 dark:text-white">855-660-5862</span>.
            </p>
          </div>

          {/* Forgot PIN */}
          <div>
            <h3 className="text-sm font-bold text-[#1C2B4C] dark:text-white mb-1">Forgot Your Pin?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              For security purposes, we do not set up or change PINs over the phone. Please visit one of our locations for help.
            </p>
          </div>

        </div>
      </section>

      {/* 6. AURELITH RESERVE SHIELD CALLOUT BANNER */}
      <section className="bg-[#B9DCF7] dark:bg-[#13233C] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-sm md:text-base text-[#1C2B4C] dark:text-slate-100 font-normal leading-relaxed max-w-5xl">
            Not sure if a message from the Bank is legitimate? <span className="font-bold underline">Aurelith Reserve Shield</span> allows you to verify bank communications directly within digital banking, helping protect your information and accounts with confidence.
          </p>
          <button
            onClick={() => alert('Aurelith Reserve Shield Verification Tool is active in Digital Banking.')}
            className="px-6 py-2.5 bg-[#C8102E] hover:bg-[#A00B22] text-white text-xs md:text-sm font-bold rounded-full transition-all shrink-0 cursor-pointer shadow-xs"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* 7. FIND A BANK LOCATION NEAR YOU */}
      <section className="bg-white dark:bg-[#0B111E] py-14 md:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-5 flex flex-col justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#1C2B4C] dark:text-white mb-5 leading-[1.12] tracking-tight max-w-sm">
              Find a bank location near you
            </h2>
            <p className="text-base sm:text-lg text-slate-900 dark:text-slate-200 mb-5 font-normal leading-snug">
              Because some conversations are best had in person.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-md">
              Whether you have questions about your account, need assistance with loans, or simply want to discuss your financial goals, we're here for you.
            </p>
            <div className="flex justify-center md:justify-start">
              <button
                onClick={onOpenLocations}
                className="px-7 py-3 bg-[#C8102E] hover:bg-[#A00B22] text-white text-sm font-bold rounded-full transition-all cursor-pointer shadow-xs"
              >
                Find a Location
              </button>
            </div>
          </div>

          <div className="md:col-span-7 flex justify-center md:justify-end">
            <div className="rounded-[24px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 w-full max-w-2xl">
              <img
                src="https://i.imgur.com/Fuj1Zcd.jpg"
                alt="Bank Representative at Desk"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "https://i.imgur.com/Fuj1Zcd.png") {
                    target.src = "https://i.imgur.com/Fuj1Zcd.png";
                  }
                }}
                className="w-full h-[320px] sm:h-[380px] md:h-[420px] object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT / FEEDBACK FORM SECTION */}
      <section id="contact-form-section" className="bg-[#F0F6FA] dark:bg-[#0E1726] py-14 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Left Headings */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C2B4C] dark:text-white leading-snug">
              Need help with something else?
            </h2>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C2B4C] dark:text-white leading-snug">
              Looking for more information?
            </h2>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C2B4C] dark:text-white leading-snug mb-4">
              Have some feedback?
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1C2B4C] dark:text-white">
              We'd love to hear from you.
            </p>
          </div>

          {/* Right Form */}
          <div className="w-full">
            {formSubmitted ? (
              <div className="bg-white dark:bg-[#152033] p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-[#1C2B4C] dark:text-white mb-2">Thank you for reaching out!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your message has been sent successfully. An Aurelith Reserve representative will get back to you shortly.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-6 px-6 py-2 bg-[#202B48] hover:bg-[#141C31] text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    First name <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#152033] text-slate-800 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] transition-all"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Last name <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#152033] text-slate-800 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#152033] text-slate-800 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#152033] text-slate-800 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] transition-all"
                  />
                </div>

                {/* Best Time to Reach You */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Best Time to Reach You
                  </label>
                  <select
                    value={formData.bestTime}
                    onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#152033] text-slate-800 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select one</option>
                    <option value="morning">Morning (8am - 12pm)</option>
                    <option value="afternoon">Afternoon (12pm - 5pm)</option>
                    <option value="evening">Evening (5pm - 7pm)</option>
                  </select>
                </div>

                {/* Leave a message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Leave a message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#152033] text-slate-800 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] transition-all resize-y"
                  ></textarea>
                </div>

                {/* Notice */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal pt-1">
                  Please note that email is not a secure method of communication. Do not include sensitive data in this form such as account numbers or personal information.
                </p>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-7 py-2.5 bg-[#202B48] hover:bg-[#151D33] text-white text-xs md:text-sm font-bold rounded-full transition-all cursor-pointer shadow-xs"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* 9. ADVANCED SECURITY WITH VOICE BIOMETRICS */}
      <section className="relative w-full text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://i.imgur.com/ZmLAReY.jpg"
            alt="Voice Biometrics Security"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== "https://i.imgur.com/ZmLAReY.png") {
                target.src = "https://i.imgur.com/ZmLAReY.png";
              }
            }}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Advanced Security<br />with Voice Biometrics
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed mb-3 text-white/90">
              Experience the next level of account protection with Aurelith Reserve Pass. Our cutting-edge voice biometrics tool uses advanced authentication technology to match your unique voice, ensuring that only you can access your account.
            </p>
            <p className="text-xs sm:text-sm font-semibold mb-6 text-white">
              Call us at 855-660-5862 to enroll in a matter of minutes.
            </p>
            <button
              onClick={() => alert('Call 855-660-5862 to enroll in Aurelith Reserve Pass Voice Biometrics.')}
              className="px-6 py-2.5 bg-white text-[#960B21] hover:bg-slate-100 font-bold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
