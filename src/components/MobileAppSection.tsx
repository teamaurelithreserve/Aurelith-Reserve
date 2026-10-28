import React, { useState } from 'react';

export const MobileAppSection: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="w-full bg-white dark:bg-[#0B111E] py-6 md:py-8 flex justify-center items-center px-6 md:px-16 lg:px-20 transition-colors duration-200">
      <div className="w-full max-w-[96%] xl:max-w-[1650px] overflow-hidden flex justify-center items-center bg-white dark:bg-[#0B111E]">
        <img
          src={imgError ? "https://i.imgur.com/Uc7oN6z.jpg" : "https://i.imgur.com/Uc7oN6z.png"}
          alt="Banking That Moves With You"
          onError={() => setImgError(true)}
          className="w-full h-auto object-contain max-h-[600px] md:max-h-[700px] rounded-2xl"
        />
      </div>
    </section>
  );
};
