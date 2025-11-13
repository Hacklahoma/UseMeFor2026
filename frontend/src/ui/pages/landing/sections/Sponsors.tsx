import React from "react";

import NickLogo from "../../../common/assets/sponsors/Nick.png";
import BoeingLogo from "../../../common/assets/sponsors/Boeing.png";
import HomeCreationsLogo from "../../../common/assets/sponsors/HomeCreations.png";
import NorthropGrummanLogo from "../../../common/assets/sponsors/NorthropGrumman.png";

interface SponsorLogo {
  src: string;
  alt: string;
  href?: string;
}

// Add your sponsor logos here
const sponsorLogos: SponsorLogo[] = [
  {
    src: HomeCreationsLogo,
    alt: "Sponsor 1",
    href: "https://www.homecreations.com/",
  },
  {
    src: BoeingLogo,
    alt: "Sponsor 2",
    href: "https://www.boeing.com/",
  },
  {
    src: NickLogo,
    alt: "Sponsor 3",
    href: "https://www.linkedin.com/in/nicholas-gavalas/",
  },
  {
    src: NorthropGrummanLogo,
    alt: "Sponsor 4",
    href: "https://www.northropgrumman.com/",
  },
];

const Sponsors: React.FC = () => {
  return (
    <section id="sponsors" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#3D472C] font-serif">
            Sponsors
          </h2>
        </div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {sponsorLogos.map((sponsor, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 md:p-6 lg:p-6 h-36 md:h-40 lg:h-44 flex items-center justify-center ${
                // Center items for different screen sizes
                index === sponsorLogos.length - 1 &&
                sponsorLogos.length % 2 === 1
                  ? "sm:col-span-2 sm:max-w-md sm:mx-auto"
                  : index === sponsorLogos.length - 1 &&
                    sponsorLogos.length % 4 === 1
                  ? "lg:col-span-4 lg:max-w-sm lg:mx-auto"
                  : index === sponsorLogos.length - 1 &&
                    sponsorLogos.length % 4 === 2
                  ? "lg:col-span-2 lg:max-w-md lg:mx-auto"
                  : index === sponsorLogos.length - 1 &&
                    sponsorLogos.length % 4 === 3
                  ? "lg:col-span-3 lg:max-w-lg lg:mx-auto"
                  : ""
              }`}
            >
              {sponsor.href ? (
                <a
                  href={sponsor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full flex items-center justify-center transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src={sponsor.src}
                    alt={sponsor.alt}
                    className="w-full h-full max-w-[260px] max-h-[140px] object-contain"
                  />
                </a>
              ) : (
                <img
                  src={sponsor.src}
                  alt={sponsor.alt}
                  className="w-full h-full max-w-[260px] max-h-[140px] object-contain"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
