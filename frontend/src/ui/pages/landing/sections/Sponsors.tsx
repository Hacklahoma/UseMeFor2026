import React from "react";

import NicholasGavalasLogo from "../../../common/assets/sponsors/NicholasGavalas.png";
import BoeingLogo from "../../../common/assets/sponsors/Boeing.png";
import HomeCreationsLogo from "../../../common/assets/sponsors/HomeCreations.png";
import NorthropGrummanLogo from "../../../common/assets/sponsors/NorthropGrumman.png";
import WilliamsLogo from "../../../common/assets/sponsors/Williams.png";
import PaycomLogo from "../../../common/assets/sponsors/Paycom.png";
import CocaColaLogo from "../../../common/assets/sponsors/CocaCola.png";
import AmericanFidelityLogo from "../../../common/assets/sponsors/AmericanFidelity.png";
import PureButtons from "../../../common/assets/sponsors/PureButtons.png";
import RedBullLogo from "../../../common/assets/sponsors/VerticalRedBull.svg";
import TomLoveLogo from "../../../common/assets/sponsors/TomLove.png";

interface SponsorLogo {
  src: string;
  alt: string;
  href?: string;
}

// Add your sponsor logos here
const sponsorLogos: SponsorLogo[] = [
  {
    src: HomeCreationsLogo,
    alt: "Sponsor 1 Home Creations",
    href: "https://www.homecreations.com/",
  },
  {
    src: BoeingLogo,
    alt: "Sponsor 2 Boeing",
    href: "https://www.boeing.com/",
  },
  {
    src: NicholasGavalasLogo,
    alt: "Sponsor 3 Nicholas Gavalas",
    href: "https://www.linkedin.com/in/nicholas-gavalas/",
  },
  {
    src: NorthropGrummanLogo,
    alt: "Sponsor 4 Northrop Grumman",
    href: "https://www.northropgrumman.com/",
  },
  {
    src: WilliamsLogo,
    alt: "Sponsor 5 Williams",
    href: "https://www.williams.com/",
  },
  {
    src: PaycomLogo,
    alt: "Sponsor 6 Paycom",
    href: "https://www.paycom.com/",
  },
  {
    src: CocaColaLogo,
    alt: "Sponsor 7 Coca-Cola",
    href: "https://www.coca-cola.com/",
  },
  {
    src: AmericanFidelityLogo,
    alt: "Sponsor 8 American Fidelity",
    href: "https://www.americanfidelity.com/",
  },
  {
    src: PureButtons,
    alt: "Sponsor 9 Pure Buttons",
    href: "https://www.purebuttons.com/?ajs_uid=01963cf1-6fe7-46e5-8b9b-9f3b45e49a41&utm_campaign=Member+Event+-+Pure+Buttons+Intro&utm_content=Pure+Buttons+Intro&utm_medium=Email&utm_source=Customer.iohttps://purebuttons.com/",
  }
  {
    src: RedBullLogo,
    alt: "Sponsor 10 Red Bull",
    href: "https://www.redbull.com/",
  },
  {
    src: TomLoveLogo,
    alt: "Sponsor 11 Tom Love",
    href: "https://www.tomlove.com/",
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
              key={sponsor.href ? sponsor.href : `${sponsor.src}-${index}`}
              className={`rounded-lg p-4 md:p-6 lg:p-6 h-36 md:h-40 lg:h-44 flex items-center justify-center ${
                // Center items for small screen (2 columns) when odd number, but not on desktop
                index === sponsorLogos.length - 1 &&
                sponsorLogos.length % 2 === 1
                  ? "sm:col-span-2 sm:max-w-md sm:mx-auto lg:col-span-1 lg:max-w-none lg:mx-0"
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
                    className="w-[240px] h-auto max-h-[140px] object-contain"
                  />
                </a>
              ) : (
                <img
                  src={sponsor.src}
                  alt={sponsor.alt}
                  className="w-[240px] h-auto max-h-[140px] object-contain"
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
