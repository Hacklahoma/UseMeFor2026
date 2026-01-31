// FAQPage.tsx
import React from "react";
import gridImg from "../../common/assets/faq/grid.png";
import passportImg from "../../common/assets/faq/passport.png";

import stampOne from "../../common/assets/faq/stamps/stamp_one.png";
import stampTwo from "../../common/assets/faq/stamps/stamp_two.png";
import stampThree from "../../common/assets/faq/stamps/stamp_three.png";
import stampFour from "../../common/assets/faq/stamps/stamp_four.png";
import stampFive from "../../common/assets/faq/stamps/stamp_five.png";
import stampSix from "../../common/assets/faq/stamps/stamp_six.png";
import stampSeven from "../../common/assets/faq/stamps/stamp_seven.png";
import stampEight from "../../common/assets/faq/stamps/stamp_eight.png";
import stampNine from "../../common/assets/faq/stamps/stamp_nine.png";
import stampTen from "../../common/assets/faq/stamps/stamp_ten.png";
import stampEleven from "../../common/assets/faq/stamps/stamp_eleven.png";

// Mapping of stamp keys to images
const stampImages = {
  stamp_one: stampOne,
  stamp_two: stampTwo,
  stamp_three: stampThree,
  stamp_four: stampFour,
  stamp_five: stampFive,
  stamp_six: stampSix,
  stamp_seven: stampSeven,
  stamp_eight: stampEight,
  stamp_nine: stampNine,
  stamp_ten: stampTen,
  stamp_eleven: stampEleven,
} as const;

// Stamp position adjustments
const stampTranslations = {
  stamp_one: "-translate-y-1",
  stamp_two: "-translate-y-1",
  stamp_three: "-translate-y-1",
  stamp_four: "translate-x-0.5 translate-y-1",
  stamp_five: "translate-x-0.5 -translate-y-2",
  stamp_six: "-translate-y-2",
  stamp_seven: "translate-x-0.5 -translate-y-2",
  stamp_eight: "-translate-y-2",
  stamp_nine: "-translate-y-1",
  stamp_ten: "-translate-y-1",
  stamp_eleven: "-translate-y-1",
} as const;

type StampKey = keyof typeof stampImages;

type Cell = {
  id: string;
  text: string;
  stamp?: StampKey;
};

// FAQ cells data
const cells: Cell[] = [
  {
    id: "c1",
    text:
      "A hack is something that is jury-rigged inelegantly but effectively, usually as a temporary solution to a problem. Like duct taping a hole in a sinking boat to keep it afloat.",
    stamp: "stamp_one",
  },
  { id: "c2", text: "Admissions is completely free for all students!", stamp: "stamp_two" },
  { id: "c3", text: "At this time, we will not be providing travel reimbursements.", stamp: "stamp_three" },
  {
    id: "c4",
    text:
      "We will supply food for Saturday's lunch, dinner, and Sunday's breakfast with plenty of snacks and drinks throughout. All free of charge!",
    stamp: "stamp_four",
  },
  {
    id: "c5",
    text:
      "No experience is needed. Whether you're a coder, an artist, or a writer, you'll get to work with various mentors, attend workshops, interact with companies, and learn alongside fellow participants.",
    stamp: "stamp_five",
  },
  {
    id: "c6",
    text:
      "We encourage everyone to work with a team! Teams may contain up to 4 people. We will also be offering a team-building session at the beginning of the hacking period.",
    stamp: "stamp_six",
  },
  {
    id: "c7",
    text:
      "You should bring a laptop, chargers, toiletries, a change of clothes, sleeping bag, pillow, and anything else you would need for an overnight weekend. Keep in mind that Hacklahoma will last for 24hrs.",
    stamp: "stamp_seven",
  },
  {
    id: "c8",
    text:
      "Hacklahoma welcomes students from all backgrounds and values the importance of a safe and all-inclusive space. Anyone attending must adhere to the MLH Code of Conduct.",
    stamp: "stamp_eight",
  },
  {
    id: "c9",
    text:
      "Any student over the age of 18 can participate, regardless of major, background, or skill level.",
    stamp: "stamp_nine",
  },
  {
    id: "c10",
    text:
      "No, you cannot work or copy past projects. You can brainstorm ideas and collect whatever software and tools you need, as long as the project is completely new.",
    stamp: "stamp_ten",
  },
  { id: "c11", text: "No, you're not confined here. Feel free to go home and get some rest, but be back in time for judging!", stamp: "stamp_eleven" },
  { id: "c12", text: "If your question wasn't answered, please feel free to contact us via Instagram, Twitter, Facebook or send us an email to hacklahoma@ou.edu" },
];

type StampState = "shown" | "hiding" | "hidden";

const FAQPage: React.FC = () => {
  // Stamp state per cell (only cells with stamp start as "shown")
  const [stampStates, setStampStates] = React.useState<Record<string, StampState>>(() => {
    const init: Record<string, StampState> = {};
    for (const c of cells) init[c.id] = c.stamp ? "shown" : "hidden";
    return init;
  });

  const dismissStamp = (id: string) => {
    setStampStates((prev) => {
      if (prev[id] !== "shown") return prev;
      return { ...prev, [id]: "hiding" };
    });

    window.setTimeout(() => {
      setStampStates((prev) => ({ ...prev, [id]: "hidden" }));
    }, 450);
  };

  return (
    <section data-section="faq-page-section" className="min-h-screen bg-transparent py-4 sm:py-6 px-2 sm:px-4 flex items-center justify-center">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-5 sm:gap-6 lg:gap-2">
          {/* LEFT PAGE */}
          <article id="faq-selfie-page" className="relative flex items-center justify-center w-full lg:w-auto">
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

              {/* SCHEDULE */}
              <div className="absolute left-[8%] top-[12%] w-[84%] h-[76%] z-20 overflow-y-auto px-2 sm:px-4 font-mono font-normal">
                <div className="text-[#3D472C] space-y-1.5 mobile-m:space-y-2 mobile-l:space-y-2.5 sm:space-y-3 lg:space-y-1 xl:space-y-3 text-center">
                  {/* Title */}
                  <h2 className="font-extrabold text-[clamp(0.55rem,4vw,1.25rem)] mb-1 sm:mb-2 lg:mb-1">
                    Live Schedule
                  </h2>

                  {/* Saturday */}
                  <div>
                    <h3 className="font-bold text-[clamp(0.4rem,2.5vw,0.8rem)] mb-1 sm:mb-1">
                      Saturday, February 7th
                    </h3>
                    <div className="space-y-0.5 mobile-m:space-y-1 mobile-l:space-y-1.5 sm:space-y-2 lg:space-y-1 xl:space-y-2 text-[clamp(0.35rem,1.8vw,0.7rem)]">
                      <p><span className="font-bold">9:30 AM (CST)</span> - Doors Open & Hacker Check-In</p>
                      <p><span className="font-bold">11:30 AM (CST)</span> - Opening Ceremony</p>
                      <p><span className="font-bold">12:00 PM (CST)</span> - Hacking Begins!</p>
                      <p><span className="font-bold">1:30 PM (CST)</span> - Lunch</p>
                      <p><span className="font-bold">2:30 PM (CST)</span> - American Fidelity Workshop: AI Voice Incorporation</p>
                      <p><span className="font-bold">3:00 PM (CST)</span> - Snack Time</p>
                      <p><span className="font-bold">3:30 PM (CST)</span> - AI Agents & Vibe Engineering Workshop with Fazil Raja</p>
                      <p><span className="font-bold">4:30 PM (CST)</span> - Innovation Hub Workshop</p>
                      <p><span className="font-bold">5:30 PM (CST)</span> - Workshop</p>
                      <p><span className="font-bold">7:00 PM (CST)</span> - Dinner</p>
                      <p><span className="font-bold">8:00 PM (CST)</span> - MLH Event Workshop</p>
                      <p><span className="font-bold">10:00 PM (CST)</span> - Chess & Smash Tournament</p>
                      <p><span className="font-bold">12:00 AM (CST)</span> - Midnight Snack</p>
                      <p><span className="font-bold">12:30 AM (CST)</span> - Karaoke Activity</p>
                    </div>
                  </div>

                  {/* Sunday */}
                  <div>
                    <h3 className="font-bold text-[clamp(0.4rem,2.5vw,0.8rem)] mb-1 sm:mb-2">
                      Sunday, February 8th
                    </h3>
                    <div className="space-y-0.5 mobile-m:space-y-1 mobile-l:space-y-1.5 sm:space-y-2 lg:space-y-1 xl:space-y-2 text-[clamp(0.35rem,1.8vw,0.7rem)]">
                      <p><span className="font-bold">9:30 AM (CST)</span> - Levity Activity</p>
                      <p><span className="font-bold">10:00 AM (CST)</span> - Google Developer Group Workshop</p>
                      <p><span className="font-bold">11:00 AM (CST)</span> - Soft Submission Deadline</p>
                      <p><span className="font-bold">12:00 PM (CST)</span> - Hacking Ends / Submissions Due</p>
                      <p><span className="font-bold">12:00–1:30 PM (CST)</span> - Judging & Expo</p>
                      <p><span className="font-bold">2:30 PM (CST)</span> - Closing Ceremony</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* SPINE (xl+) */}
          <div className="hidden xl:flex items-center justify-center w-1">
            <div className="h-[80vh] w-[2px] bg-neutral-700/60 rounded" />
          </div>

          {/* RIGHT PAGE */}
          <article id="faq" data-section="faq-questions-page" className="relative flex items-center justify-center w-full lg:w-auto" style={{ scrollMarginTop: '10vh' }}>
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

              {/* grid */}
              <div
                id="faq-questions-grid"
                className="
                  absolute
                  left-[10%] top-[15%]
                  w-[80%] h-[80%]
                  grid grid-cols-3 grid-rows-4
                  gap-[5%]
                  z-20
                "
              >
                {cells.map((cell) => {
                  const hasStamp = !!cell.stamp;
                  const state = stampStates[cell.id] ?? "hidden";
                  const stampImage = cell.stamp ? stampImages[cell.stamp] : null;
                  const stampTranslation = cell.stamp ? stampTranslations[cell.stamp] : "";

                  return (
                    <div key={cell.id} className="relative">
                      {/* Text underneath */}
                      <div
                        className={[
                          "absolute inset-0 z-10 p-[4%] flex items-center justify-center transition-opacity duration-300",
                          hasStamp && state === "shown" ? "opacity-0" : "opacity-100",
                        ].join(" ")}
                      >
                        <p
                          className="
                            text-center whitespace-pre-line leading-tight text-gray-900
                            text-[5px] sm:text-[9px] lg:text-[8px] xl:text-[10px]
                          "
                        >
                          {cell.text}
                        </p>
                      </div>

                      {/* Stamp overlay fills square + fades away */}
                      {hasStamp && state !== "hidden" && (
                        <button
                          type="button"
                          onClick={() => dismissStamp(cell.id)}
                          className={[
                            "absolute inset-0 z-30",
                            "transition-all duration-[450ms] ease-out",
                            state === "shown"
                              ? "opacity-100 scale-100 rotate-0"
                              : "opacity-0 scale-[0.98] -rotate-2 pointer-events-none",
                          ].join(" ")}
                          aria-label="Remove stamp"
                        >
                          <img
                            src={stampImage!}
                            alt=""
                            className={[
                              "w-full h-full object-contain scale-125 select-none",
                              stampTranslation,
                            ].join(" ")}
                            draggable={false}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default FAQPage;
