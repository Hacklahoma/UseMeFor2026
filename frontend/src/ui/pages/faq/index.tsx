import React from "react";
import gridImg from "../../common/assets/faq/grid.png";
import passportImg from "../../common/assets/faq/passport.png";
import SelfieCapture from "./section/SelfieCapture";

const FAQPage: React.FC = () => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [school, setSchool] = React.useState("");
  const [signature, setSignature] = React.useState("");

  const fields = [
    { label: "first name:", placeholder: "write your first name here" },
    { label: "last name:", placeholder: "write your last name here" },
    { label: "school:", placeholder: "write your school here" },
  ];

  return (
    <main className="min-h-screen bg-transparent py-6 px-4 flex items-center justify-center">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-0">

          {/* LEFT PAGE */}
          <article className="relative flex items-center justify-center w-full lg:w-auto">
            <div
              className="
                relative
                w-[min(92vw,520px)]
                sm:w-[min(86vw,620px)]
                aspect-[1538/2048]
                lg:h-[min(86vh,820px)]
              "
            >
              {/* Background PNG */}
              <img
                src={passportImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* NAME FIELDS */}
              <div className="absolute left-[10%] top-[9%] w-[60%] z-20 space-y-3 sm:space-y-4">
                {/* FIRST NAME */}
                <div>
                  <div className="text-[8px] sm:text-lg text-gray-900 font-bold flex items-baseline">
                    <span>{fields[0].label}</span>
              
                    <input
                      value={firstName}
                      placeholder={fields[0].placeholder}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`flex-1 ml-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600 text-[7px] sm:text-xs md:text-base leading-tight placeholder-gray-500 ${firstName ? 'text-black font-bold' : 'text-gray-500'}`}
                    />
                  </div>
                </div>

                {/* LAST NAME */}
                <div>
                  <div className="text-[8px] sm:text-lg text-gray-900 font-bold flex items-baseline">
                    <span>{fields[1].label}</span>
          
                    <input
                      value={lastName}
                      placeholder={fields[1].placeholder}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`flex-1 ml-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600 text-[7px] sm:text-xs md:text-base leading-tight placeholder-gray-500 ${lastName ? 'text-black font-bold' : 'text-gray-500'}`}
                    />
                  </div>
                </div>

                {/* SCHOOL */}
                <div>
                   <div className="text-[8px] sm:text-lg text-gray-900 font-bold flex items-baseline">
                    <span>{fields[2].label}</span>
              
                    <input
                      value={school}
                      placeholder={fields[2].placeholder}
                      onChange={(e) => setSchool(e.target.value)}
                      className={`flex-1 ml-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600 text-[7px] sm:text-xs md:text-base leading-tight placeholder-gray-500 ${school ? 'text-black font-bold' : 'text-gray-500'}`}
                    />
                  </div>
                </div>
              </div>

              {/* SIGNATURE */}
              <div className="absolute left-[9%] top-[87%] sm:top-[89%] w-[60%] z-20">
                <div className="text-[8px] sm:text-lg text-gray-900 font-bold flex items-baseline">
                  <span>X:</span>
                  
                  <input
                    value={signature}
                    placeholder="print name here"
                    onChange={(e) => setSignature(e.target.value)}
                    className={`flex-1 ml-2 bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600 text-[7px] sm:text-xs md:text-base leading-tight placeholder-gray-500 ${signature ? 'text-black font-bold' : 'text-gray-500'}`}
                  />
                </div>
              </div>

              {/* SELFIE */}
              <div className="absolute left-[11.5%] top-[26.9%] w-[38%] h-[29.5%] z-30 overflow-hidden">
                <SelfieCapture id="faq-selfie" compact />
              </div>
            </div>
          </article>

          {/* SPINE (DESKTOP ONLY) */}
          <div className="hidden lg:flex items-center justify-center w-1">
            <div className="h-[min(86vh,820px)] w-[2px] bg-neutral-700/60 rounded" />
          </div>

          {/* RIGHT PAGE */}
          <article className="relative flex items-center justify-center w-full lg:w-auto">
            <div
              className="
                relative
                w-[min(92vw,520px)]
                sm:w-[min(86vw,620px)]
                aspect-[1538/2048]
                lg:h-[min(86vh,820px)]
              "
            >
              <img
                src={gridImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>
          </article>

        </div>
      </div>
    </main>
  );
};

export default FAQPage;
