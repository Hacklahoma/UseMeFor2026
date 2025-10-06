import React from "react";
import Logo1 from "../../../common/assets/LOGO1.png";

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="relative min-h-[100svh] w-full min-w-[380px] m-0 py-16 px-6 overflow-hidden flex items-center justify-center"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center">
          <img
            src={Logo1}
            alt="Hacklahoma Logo"
            className="w-40 md:w-56 lg:w-64 h-auto object-contain"
          />
        </div>
        <p className="mt-3 text-lg md:text-xl text-[#3D472C] text-center opacity-90">
          Oklahoma's Largest Hackathon
        </p>

        <div className="mt-10 md:mt-12 text-[#3D472C] text-lg leading-relaxed space-y-4 max-w-3xl mx-auto text-center">
          <p>
            In 24 hours, you're going to build something that doesn't exist yet.
          </p>
          <p>
            You're going to meet companies, learn from mentors, probably drink
            way too much caffeine.
          </p>
          <p>
            We're going to give you so many resources that it won't even matter
            if you've coded before.
          </p>
          <p>And just for coming, we'll throw in some free merch too.</p>
          <p className="font-medium">So... what will you build?</p>
        </div>
      </div>
    </section>
  );
};

export default About;
