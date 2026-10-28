import React, { useState } from 'react';
import { X, MapPin, Phone, Clock, Search, Navigation } from 'lucide-react';
import { texasBranches } from '../data/mockData';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredBranches = texasBranches.filter(
    (b) =>
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.zip.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#152033] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#1C2B4C] text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8102E] flex items-center justify-center text-white font-extrabold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl leading-tight text-white">Aurelith Reserve Locations</h3>
              <p className="text-xs text-slate-300">79 branches across Texas to serve you</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 bg-slate-50 dark:bg-[#10192A] border-b border-gray-200 dark:border-slate-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by city, branch name, or ZIP code (e.g. Abilene, Fort Worth, 79601)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#152033] border border-gray-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
              autoFocus
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 dark:text-slate-500" />
          </div>
        </div>

        {/* Branch List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredBranches.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
              No branches found matching "{searchTerm}". Try searching for Abilene, Fort Worth, Glen Rose, or San Angelo.
            </div>
          ) : (
            filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white dark:bg-[#121c2d] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:border-[#C8102E] dark:hover:border-red-500 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <h4 className="font-bold text-base text-[#1C2B4C] dark:text-white mb-1">{branch.name}</h4>
                  <div className="text-xs text-gray-600 dark:text-slate-300 space-y-1">
                    <p>{branch.address}, {branch.city}, TX {branch.zip}</p>
                    <div className="flex items-center space-x-3 pt-1 text-gray-500 dark:text-slate-400">
                      <span className="flex items-center"><Phone className="w-3 h-3 mr-1" />{branch.phone}</span>
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{branch.hours}</span>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex space-x-2 mt-3">
                    {branch.hasLobby && <span className="bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">Lobby</span>}
                    {branch.hasDriveThru && <span className="bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">Drive-Thru</span>}
                    {branch.hasATM && <span className="bg-slate-100 dark:bg-slate-800 text-[#1C2B4C] dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">24/7 ATM</span>}
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(branch.address + ', ' + branch.city + ' TX')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#1C2B4C] dark:bg-[#C8102E] hover:bg-[#152033] dark:hover:bg-[#A00B22] text-white text-xs font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1.5" />
                  Get Directions
                </a>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
