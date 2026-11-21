import React from 'react';

export const PartnerMarquee: React.FC = () => {
  // Neutral aesthetic apparel & performance gear placeholder wordmarks
  const brands = [
    'TITAN FORGE',
    'APEX ATHLETICA',
    'AESTHETIX LAB',
    'HYPERWEAR',
    'KINETIC PRO',
    'VORTEX STRIDE',
    'IRON CLAN',
    'AURA RECOVERY',
  ];

  return (
    <section className="py-8 border-y border-border/80 bg-surface/40 overflow-hidden relative select-none">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

      <div className="flex items-center">
        <div className="animate-marquee flex items-center gap-12 sm:gap-20 opacity-45 hover:opacity-100 transition-opacity duration-normal">
          {brands.concat(brands).map((brand, idx) => (
            <div
              key={idx}
              className="font-display text-lg sm:text-xl font-extrabold tracking-widest text-text uppercase whitespace-nowrap hover:text-accent transition-colors cursor-pointer"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
