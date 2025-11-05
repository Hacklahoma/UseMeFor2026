export const ANIMATION_TIMINGS = {
  TYPING_DELAY: 1500,
  MESSAGE_VISIBILITY_DELAY: 1500,
  INPUT_ENABLE_DELAY: 300,
  FADE_TRANSITION_DELAY: 1000,
  FORM_SHOW_DELAY: 5500,
  STAGE_TRANSITION_DELAY: 3000,
} as const;

export const INITIAL_MESSAGE: { id: string; text: string; sender: 'bot' } = {
  id: '1',
  text: "Hello. What is your name?",
  sender: 'bot'
};

export const INITIAL_FORM_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  school: '',
  major: '',
  grade: '',
  dietaryRestriction: '',
  dietaryOther: '',
  profilePicture: null as File | null,
  github: '',
  linkedin: '',
  discord: '',
  instagram: '',
  resume: null as File | null,
} as const;

