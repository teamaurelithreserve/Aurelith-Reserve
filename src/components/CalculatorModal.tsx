import React, { useState } from 'react';
import { X, Calculator, DollarSign, Calendar, Percent } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [loanAmount, setLoanAmount] = useState(250000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);

  if (!isOpen) return null;

  // Monthly Loan Payment Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = termYears * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : loanAmount / numberOfPayments;

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-[#1C2B4C] text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8102E] flex items-center justify-center text-white font-extrabold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl leading-tight text-white">Aurelith Reserve Loan Calculator</h3>
              <p className="text-xs text-slate-300">Estimate your monthly mortgage & personal loan payments</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="space-y-6">
            
            {/* Loan Amount */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
                <span>Loan Amount</span>
                <span className="text-[#1C2B4C] dark:text-white text-sm font-extrabold">${loanAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-[#C8102E] cursor-pointer"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
                <span>Interest Rate</span>
                <span className="text-[#1C2B4C] dark:text-white text-sm font-extrabold">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="12.0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#C8102E] cursor-pointer"
              />
            </div>

            {/* Loan Term */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
                <span>Loan Term</span>
                <span className="text-[#1C2B4C] dark:text-white text-sm font-extrabold">{termYears} Years</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    onClick={() => setTermYears(term)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      termYears === term
                        ? 'bg-[#1C2B4C] dark:bg-red-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {term} Yrs
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Payment Results Box */}
          <div className="bg-[#BEE0F8] dark:bg-[#101b2d] rounded-2xl p-6 flex flex-col justify-between text-[#1C2B4C] dark:text-slate-100 border border-transparent dark:border-slate-800">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">
                Estimated Monthly Payment
              </div>
              <div className="text-4xl font-extrabold text-[#C8102E] dark:text-red-400 my-2">
                ${monthlyPayment.toFixed(2)}
                <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">/mo</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-300/60 dark:border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Principal Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white">${loanAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Total Interest Payable:</span>
                  <span className="font-bold text-slate-900 dark:text-white">${Math.round(totalInterest).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Total Payment over {termYears} Yrs:</span>
                  <span className="font-bold text-slate-900 dark:text-white">${Math.round(totalPayment).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => { alert('Connecting you with an Aurelith Reserve Mortgage Specialist...'); onClose(); }}
                className="w-full py-3 bg-[#1C2B4C] dark:bg-[#C8102E] hover:bg-[#152033] dark:hover:bg-[#A00B22] text-white font-bold text-xs rounded-full shadow-md transition-colors cursor-pointer"
              >
                Apply for Loan
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
