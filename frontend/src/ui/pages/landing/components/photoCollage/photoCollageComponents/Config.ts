// Global constants for photo collage animations
const configSettings = {
    FRAMED_CARD_BG: '#f4ece1',
    SCALE_VALUE: 0.7 as number,
    OFF_SCREEN_DISTANCE: '35vw',
    DESKTOP_LARGE_FLY_DISTANCE: '40vw',  // >= 1650px
    DESKTOP_FLY_DISTANCE: '45vw',        // 1024px - 1649px
    TABLET_FLY_DISTANCE: '55vw',         // 768px - 1023px
    SMALL_TABLET_FLY_DISTANCE: '65vw',   // 600px - 767px
    MOBILE_FLY_DISTANCE: '75vw',         // < 600px
    SHUFFLE_DELAY: 400, // ms - delay before cards fly back in after shuffle
}

export default configSettings;

