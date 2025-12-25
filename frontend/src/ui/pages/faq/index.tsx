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
    <main className="min-h-screen bg-transparent py-4 sm:py-6 px-2 sm:px-4 flex items-center justify-center">
      <div className="w-full max-w-7xl">
        {/* Tight gap on desktop, normal gap on mobile */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-5 sm:gap-6 lg:gap-2">

          {/* LEFT PAGE */}
          <article className="relative flex items-center justify-center w-full lg:w-auto">
            <div
              className="
                relative
                w-[min(94vw,520px)]
                sm:w-[min(88vw,620px)]
                lg:w-[min(46vw,460px)]
                xl:w-[min(40vw,600px)]
                aspect-[1538/2048]
              "
            >
              <img
                src={passportImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
              />

              {/* NAME FIELDS */}
              <div className="absolute left-[10%] top-[9%] w-[60%] z-20 space-y-3 sm:space-y-4 lg:space-y-4">
                {/* FIRST NAME */}
                <div className="flex items-baseline font-bold text-gray-900 text-[8px] sm:text-[12px] lg:text-[14px] xl:text-lg ">
                  <span>{fields[0].label}</span>
                  <input
                    value={firstName}
                    placeholder={fields[0].placeholder}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`
                      flex-1 ml-2 bg-transparent border-b border-gray-400
                      focus:outline-none focus:border-gray-600
                      text-[7px] sm:text-[10px] lg:text-[9px] xl:text-xs
                      leading-none py-0 placeholder-gray-500
                      ${firstName ? "text-black font-bold" : "text-gray-500"}
                    `}
                  />
                </div>

                {/* LAST NAME */}
                <div className="flex items-baseline font-bold text-gray-900 text-[8px] sm:text-[12px] lg:text-[14px] xl:text-lg">
                  <span>{fields[1].label}</span>
                  <input
                    value={lastName}
                    placeholder={fields[1].placeholder}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`
                      flex-1 ml-2 bg-transparent border-b border-gray-400
                      focus:outline-none focus:border-gray-600
                      text-[7px] sm:text-[10px] lg:text-[9px] xl:text-xs
                      leading-none py-0 placeholder-gray-500
                      ${lastName ? "text-black font-bold" : "text-gray-500"}
                    `}
                  />
                </div>

                {/* SCHOOL */}
                <div className="flex items-baseline font-bold text-gray-900 text-[8px] sm:text-[12px] lg:text-[14px] xl:text-lg">
                  <span>{fields[2].label}</span>
                  <input
                    value={school}
                    placeholder={fields[2].placeholder}
                    onChange={(e) => setSchool(e.target.value)}
                    className={`
                      flex-1 ml-2 bg-transparent border-b border-gray-400
                      focus:outline-none focus:border-gray-600
                      text-[7px] sm:text-[10px] lg:text-[9px] xl:text-xs
                      leading-none py-0 placeholder-gray-500
                      ${school ? "text-black font-bold" : "text-gray-500"}
                    `}
                  />
                </div>
              </div>

              {/* SIGNATURE */}
              <div className="absolute left-[9%] top-[87%] sm:top-[87%] lg:top-[87%] xl:top-[87%] w-[60%] z-20">
                <div className="flex items-baseline font-bold text-gray-900 text-[8px] sm:text-[12px] lg:text-[14px] xl:text-lg">
                  <span>X:</span>
                  <input
                    value={signature}
                    placeholder="print name here"
                    onChange={(e) => setSignature(e.target.value)}
                    className={`
                      flex-1 ml-2 bg-transparent border-b border-gray-400
                      focus:outline-none focus:border-gray-600
                      text-[7px] sm:text-[12px] lg:text-[14px] xl:text-lg
                      leading-none py-0 placeholder-gray-500
                      ${signature ? "text-black font-bold" : "text-gray-500"}
                    `}
                  />
                </div>
              </div>

              {/* SELFIE */}
              <div className="absolute left-[11.5%] top-[26.9%] w-[38%] h-[29.5%] z-30 overflow-hidden">
                <SelfieCapture id="faq-selfie" compact />
              </div>
            </div>
          </article>

          {/* SPINE */}
          
          <div className="hidden xl:flex items-center justify-center w-1">
            <div className="h-[80vh] w-[2px] bg-neutral-700/60 rounded" />
          </div>
          

          {/* RIGHT PAGE */}
          <article className="relative flex items-center justify-center w-full lg:w-auto">
            <div
              className="
                relative
                w-[min(94vw,520px)]
                sm:w-[min(88vw,620px)]
                lg:w-[min(46vw,460px)]
                xl:w-[min(40vw,600px)]
                aspect-[1538/2048]
              "
            >
              <img
                src={gridImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover select-none"
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
